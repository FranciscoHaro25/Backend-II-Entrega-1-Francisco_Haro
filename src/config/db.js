const mongoose = require("mongoose");
require("dotenv").config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connectDB() {
    try {
      const mongoOptions = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        heartbeatFrequencyMS: 10000,
      };

      this.connection = await mongoose.connect(
        process.env.MONGO_URL,
        mongoOptions
      );
      this.isConnected = true;

      this.setupConnectionEvents();
      return this.connection;
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  setupConnectionEvents() {
    mongoose.connection.on("error", (error) => {
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      this.isConnected = true;
    });

    process.on("SIGINT", async () => {
      await this.disconnectDB();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnectDB();
      process.exit(0);
    });
  }

  async disconnectDB() {
    try {
      if (this.connection && this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        this.connection = null;
      }
    } catch (error) {
      // Silent error handling
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      readyStateText: this.getReadyStateText(),
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: Object.keys(mongoose.connection.collections || {}),
    };
  }

  getReadyStateText() {
    const states = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };
    return states[mongoose.connection.readyState] || "Unknown";
  }

  async pingDatabase() {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getDatabaseStats() {
    try {
      if (!this.isConnected) {
        throw new Error("No hay conexión activa a la base de datos");
      }

      const stats = await mongoose.connection.db.stats();
      return {
        database: stats.db,
        collections: stats.collections,
        documents: stats.objects,
        dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
        storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
        indexes: stats.indexes,
        indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      };
    } catch (error) {
      return null;
    }
  }
}

const dbConnection = new DatabaseConnection();

const connectDB = async () => {
  return await dbConnection.connectDB();
};

const disconnectDB = async () => {
  return await dbConnection.disconnectDB();
};

const getConnectionStatus = () => {
  return dbConnection.getConnectionStatus();
};

const pingDatabase = async () => {
  return await dbConnection.pingDatabase();
};

const getDatabaseStats = async () => {
  return await dbConnection.getDatabaseStats();
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  pingDatabase,
  getDatabaseStats,
  dbConnection,
};
