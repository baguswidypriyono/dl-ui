import {inject} from 'aurelia-framework';
import {Service} from "./service";
import {Router} from 'aurelia-router';
var moment = require('moment');
@inject(Router, Service)
export class List {

    info = {
        machineId: "",
        // machineEventId: '',
        productionOrderNumber: '',
        date: ""//,
        // time: 0
    };
    
    Options = {
        "readOnly": true,

    }

    constructor(router, service) {
        this.service = service;
        this.router = router;

    }

    async activate(params) {
        console.log(params);
        console.log(this.info);
        this.info.machineId = params.id;
        // this.info.machineEventId = params.eventId;
        this.info.productionOrderNumber = params.productionOrderNumber;
        this.info.date = params.date;
        // this.info.time = params.time;
        this.dateFrom = params.dateF;
        this.dateTo = params.dateT;
        this.mId = params.mId;
        this.Mach=params.Mach;
        this.meId = params.meId;
        this.MachE=params.MachE;
        this.pONOn = params.pONOn;
        this.ProdNo = params.ProdNo;
        await this.service.getMachine(this.info).then(data => {
            this.data = data;
            // this.data.DateTimeInput = moment(this.data.DateTimeInput).format("DD/MM/YYYY HH:mm:ss");
            console.log(this.data);
        })
    }

    list(mId,Mach,meId,MachE,pONOn,ProdNo,dateF,dateT) {
        console.log(this.mId);
        console.log(this.Mach);
        console.log(this.meId);
        console.log(this.MachE);
        console.log(this.pONOn);
        console.log(this.ProdNo);
        console.log(this.dateFrom);
        console.log(this.dateTo);
        this.router.navigateToRoute('list' , { mId: this.mId, Mach: this.Mach, meId: this.meId, MachE: this.MachE, pONOn: this.pONOn, ProdNo: this.ProdNo, dateF: this.dateFrom, dateT: this.dateTo });
    }


}