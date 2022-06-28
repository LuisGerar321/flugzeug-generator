import { Table, Column, DataType, Model } from "sequelize-typescript";
import { BaseModel } from "flugzeug";

@Table({
  tableName: "jwtblacklist",
})
export class JWTBlacklist extends Model {
  @Column({
    type: DataType.STRING(512),
    allowNull: false,
  })
  token: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  expires: Date;
}
