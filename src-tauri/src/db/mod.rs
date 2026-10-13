pub mod schema;

use rusqlite::{Connection, Result};
use std::path::Path;
use std::sync::Mutex;

pub struct DatabaseManager {
    pub conn: Mutex<Connection>,
}

impl DatabaseManager {
    /// Initialize local embedded SQLite database with WAL mode and run schema migrations
    pub fn init<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        
        // Execute WAL and DDL migrations
        conn.execute_batch(schema::CREATE_TABLES_SQL)?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// In-memory initialization for testing and rapid verification
    pub fn init_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch(schema::CREATE_TABLES_SQL)?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}
