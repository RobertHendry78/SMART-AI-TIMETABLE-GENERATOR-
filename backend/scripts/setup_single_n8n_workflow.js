const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const dbPath = path.join(os.homedir(), '.n8n', 'database.sqlite');
const workflowJsonPath = path.join(__dirname, '../../automation/suguna_timetable_n8n_workflow.json');

const workflowRaw = fs.readFileSync(workflowJsonPath, 'utf8');
const workflowData = JSON.parse(workflowRaw);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }

  // 1. Get owner user ID and project ID
  db.get('SELECT id FROM user LIMIT 1', (err, user) => {
    if (err || !user) {
      console.error('Owner user not found:', err);
      process.exit(1);
    }
    const userId = user.id;

    db.get('SELECT id FROM project LIMIT 1', (err, project) => {
      const projectId = project ? project.id : null;

      // 2. Clear all other workflows & publications
      db.run('DELETE FROM workflow_entity', () => {
        db.run('DELETE FROM shared_workflow', () => {
          db.run('DELETE FROM webhook_entity', () => {
            db.run('DELETE FROM workflow_published_version', () => {
              db.run('DELETE FROM workflow_history', () => {
                console.log('Cleared old workflows and published versions.');

                const wfId = 'suguna_timetable_01';
                const wfName = 'Suguna College - Smart AI Timetable & Faculty Leave Automation';
                const versionId = crypto.randomUUID();
                const nodesStr = JSON.stringify(workflowData.nodes);
                const connectionsStr = JSON.stringify(workflowData.connections);
                const settingsStr = JSON.stringify({ executionOrder: 'v1' });

                const insertWorkflowQuery = `
                  INSERT INTO workflow_entity (
                    id, name, active, nodes, connections, settings, versionId, activeVersionId, nodeGroups, createdAt, updatedAt
                  ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, '[]', datetime('now'), datetime('now'))
                `;

                db.run(insertWorkflowQuery, [wfId, wfName, nodesStr, connectionsStr, settingsStr, versionId, versionId], function(err) {
                  if (err) {
                    console.error('Error inserting workflow:', err);
                    process.exit(1);
                  }

                  console.log('✅ Inserted single workflow:', wfName);

                  // 3. Associate with project if project table exists
                  if (projectId) {
                    db.run('INSERT OR REPLACE INTO shared_workflow (workflowId, projectId, role) VALUES (?, ?, "workflow:owner")', [wfId, projectId]);
                  }

                  // 4. Insert published version
                  db.run('INSERT OR REPLACE INTO workflow_published_version (workflowId, publishedVersionId, createdAt, updatedAt) VALUES (?, ?, datetime("now"), datetime("now"))', [wfId, versionId]);

                  // 5. Insert workflow history
                  db.run(`INSERT OR REPLACE INTO workflow_history (versionId, workflowId, authors, createdAt, updatedAt, nodes, connections, name, nodeGroups)
                          VALUES (?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?, '[]')`,
                          [versionId, wfId, JSON.stringify([userId]), nodesStr, connectionsStr, wfName]);

                  // 6. Register webhook entity for active listening
                  const webhookQuery = `
                    INSERT OR REPLACE INTO webhook_entity (workflowId, webhookPath, method, node, pathLength)
                    VALUES (?, 'faculty-leave', 'POST', '1. Webhook: Faculty Leave Applied', 1)
                  `;
                  db.run(webhookQuery, [wfId], (err) => {
                    if (err) console.warn('Webhook entity warning:', err.message);
                    else console.log('✅ Registered webhook: POST /webhook/faculty-leave');

                    db.close(() => {
                      console.log('Done! n8n now has EXACTLY ONE clean workflow with published version.');
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
