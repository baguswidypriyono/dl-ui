import { inject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "../service";
var Operator = require("../../../../loader/weaving-operator-loader");

@inject(Service, Router)
export class ResumeForm {
    @bindable title;
    @bindable readOnly;
    @bindable ResumeTime;
    @bindable OnResumeOperator;

    constructor(service, router) {
        this.service = service;
        this.router = router;
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
    }

    // Loaders
    get Operators() {
        return Operator;
    }

    OnResumeOperatorChanged(newValue) {

        if (newValue) {

            if (newValue.Id && newValue.Assignment == "AJL") {

                if (this.error.OnResumeOperator) {
                    this.error.OnResumeOperator = "";
                }

                this.data.OperatorId = newValue.Id;

            } else {

                this.error.OnResumeOperator = " Bukan Operator AJL ";
            }
        }
    }

    //bindable method
    ResumeTimeChanged(newValue) {
        this.data.ResumeTime = newValue;
        this.service.getShiftByTime(newValue)
        .then(result => {
            this.data.ResumeShiftName = result.Name;
            this.data.ShiftId = result.Id;
        });
    }
}