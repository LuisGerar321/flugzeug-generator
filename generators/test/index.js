"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const changeCase = require("change-case");

const TestTypes = {
  Controller: "Controller",
  Model: "Model",
  Service: "Service",
}
module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);
    this.silent = options.silent || false;
    this.opts = options.opts || {};

    this.argument("name", {
      type: String,
      required: false,
      description: "Your testFile name",
    });
  }

  prompting() {
    if (!this.silent)
      this.log(
        "\nWelcome to the " + chalk.red("Flugzeug test") + " generator\n",
      );

    // Set default controller name to the name passed as arguments if opts.modelName is not present
    if (this.opts.testName == null && this.options.name != null) {
      this.opts.testName = changeCase.pascalCase(this.options.name);
    }

    const prompts = [
      {
        type: "list",
        name: "testType",
        message: " type:",
        default: "controller",
        choices: [
          { name: "Service", value: TestTypes.Service},
          { name: "Model", value: TestTypes.Model},
          { name: "Controller", value: TestTypes.Controller},
        ],
      },
    ];

    const promptController = {
      type: "input",
      name: "controllerName",
      message: "Controller name:",
      default: this.opts.modelName == null ? "Thing" : this.opts.modelName,
      filter: changeCase.pascalCase,
    }

    const promptModel = {
      type: "input",
      name: "modelName",
      message: "Model:",
      default: this.opts.modelName == null ? "Thing" : this.opts.modelName,
      when: this.opts.modelName == null,
    };

    const promptService = {
      type: "input",
      name: "serviceName",
      message: "Service:",
      default: this.opts.modelName == null ? "Thing" : this.opts.modelName,
      filter: changeCase.pascalCase,
    }

    return this.prompt(prompts).then(async (props) => {
      this.props = props;
      let promptsState;
      switch (props.testType) {
        case TestTypes.Service:
          promptsState = await this.prompt([promptService]);
          this.props = {...promptsState, ...this.props};
          break;
        case TestTypes.Model:
          promptsState = await this.prompt([promptModel]);
          this.props = {...promptsState, ...this.props};          
          break;
        case TestTypes.Controller:
          promptsState = await this.prompt([promptController, promptModel]);
          this.props = {...promptsState, ...this.props};
          break;
        default:
          break;
      }

      this.props = Object.keys(this.props).reduce((acc, key) => {
        if (key === "serviceName") acc.serviceNameImport = this.props[key]?.toLowerCase();
        acc[key] = this.props[key]?.replace(/^\w/, (c) => c.toUpperCase()); // To Capitalize
        return {...acc};
      }, {})
      Object.assign(this.opts, this.props);
    });
  }

  writing() {
    const fileName = this.props.name ??  ((this.props.controllerName ?? this.props.modelName) ??  this.props.serviceName);
    console.log("The file name: ", fileName);
    switch (this.props.testType) {
      case TestTypes.Service:
        this.fs.copyTpl(
          this.templatePath("../../test/templates/serviceTestTemplate.ts"),
          this.destinationPath(
            `app/test/services/${fileName}.test.ts`,
          ),
          this.props,
        );
        break;
      case TestTypes.Model:     
        this.fs.copyTpl(
          this.templatePath("../../test/templates/modelTestTemplate.ts"),
          this.destinationPath(
            `app/test/models/${fileName}.test.ts`,
          ),
          this.props,
        );
        break;
      case TestTypes.Controller:
        this.fs.copyTpl(
          this.templatePath("../../test/templates/controllerTestTemplate.ts"),
          this.destinationPath(
            `app/test/controllers/${fileName}.test.ts`,
          ),
          this.props,
        );
        break;
      default:
        break;
    }
  }
};
