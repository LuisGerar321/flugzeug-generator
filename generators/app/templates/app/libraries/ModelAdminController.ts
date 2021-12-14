import { ModelController } from "@/libraries/ModelController";
import { Model } from "sequelize";
import { Request, Response } from "express";
import { BaseController, handleServerError } from "@/libraries/BaseController";
import { hasAdminAccess } from "@/policies/Authorization";
import { Get, Put, Delete, Authentication, Post, Middlewares } from "flugzeug";

function isModelAttribute(attributes, attribute) {
  return attributes[attribute]._modelAttribute === true;
}

function formatSchemaAttribute(type, attribute, attributes) {
  return {
    type,
    readOnly: attributes[attribute]._autoGenerated ?? false,
    fieldName: attributes[attribute].field,
    allowNull: attributes[attribute].allowNull,
    values: attributes[attribute].values,
    defaultValue: attributes[attribute].defaultValue,
    validate: attributes[attribute].validate,
    references: attributes[attribute].references,
    primaryKey: attributes[attribute].primarykey,
    autoGenerated: attributes[attribute]._autoGenerated,
  };
}

@Authentication()
@Middlewares([hasAdminAccess()])
export class ModelAdminController<T extends Model> extends ModelController<T> {
  protected modelSchema: object;
  @Get("/")
  getUsers = (req: Request, res: Response) => {
    this.handleFindAll(req, res);
  };
  @Post("/")
  postUser = (req: Request, res: Response) => {
    this.handleCreate(req, res);
  };
  @Get("/schema")
  getSchema = (req: Request, res: Response) => {
    this.handleGetSchema(req, res);
  };
  @Get("/:id")
  getUser = (req: Request, res: Response) => {
    this.handleFindOne(req, res);
  };
  @Put("/:id")
  updateUser = (req: Request, res: Response) => {
    this.handleUpdate(req, res);
  };
  @Delete("/:id")
  deleteUser = (req: Request, res: Response) => {
    this.handleDelete(req, res);
  };
  handleGetSchema(req: Request, res: Response) {
    try {
      //only compute schema the first time
      if (!this.modelSchema) {
        this.generateSchema();
      }
      return BaseController.ok(res, this.modelSchema);
    } catch (err) {
      handleServerError(err, res);
    }
  }
  generateSchema() {
    const attributes = this.model.rawAttributes;
    const schema = {};
    Object.keys(attributes).forEach((attribute) => {
      const type = attributes[attribute].type.constructor.name.toLowerCase();
      if (isModelAttribute(attributes, attribute)) {
        schema[attribute] = formatSchemaAttribute(type, attribute, attributes);
      }
    });
    this.modelSchema = schema;
  }
}
