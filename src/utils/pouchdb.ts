import PouchDB from "pouchdb";

// Local PouchDB database
export const localDB = new PouchDB("local_todos");

// Remote CouchDB server URL
const remoteDB = new PouchDB(import.meta.env.COUCHDB_URL + "/todos"); // Replace with your CouchDB URL

remoteDB.info().then(function (info) {
  console.log(info);
});
const sync = localDB
  .sync(remoteDB, {
    live: true, // Continuous replication
    retry: true, // Retry on failure
  })
  .on("change", (info) => {
    // Handle document changes from replication
    console.log("Sync change:", info);
    // fetchTodos(); // Fetch the latest todos when there's a change
  })
  .on("paused", (err) => {
    console.log("Replication paused", err);
    // setSyncStatus('Replication paused');
  })
  .on("active", () => {
    console.log("Replication active");
    // setSyncStatus('Replication active');
  })
  .on("denied", (err) => {
    // setSyncStatus('Replication denied');
    console.error("Replication denied:", err);
  })
  .on("complete", (info) => {
    console.log("Replication complete:", info);
    // setSyncStatus('Replication complete');
  })
  .on("error", (err) => {
    // setSyncStatus('Replication error');
    console.error("Replication error:", err);
  });
