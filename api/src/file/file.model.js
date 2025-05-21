import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.service.js';

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.BIGINT, // для больших файлов
    allowNull: true
  },
  bucket: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: true // изменено!
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Files', // рекомендуется указать явно
  timestamps: true // если хочешь createdAt / updatedAt
});

export default File;
