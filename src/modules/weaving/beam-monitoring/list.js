import {
  inject
} from "aurelia-framework";
import {
  Service
} from "./service";
import {
  Router
} from "aurelia-router";

@inject(Router, Service)
export class List {
  context = ["detail"];

  columns = [{
      field: "BeamNumber",
      title: "No. Beam"
    },
    {
      field: "Status",
      title: "Status"
    }
  ];

  loader = info => {
    var order = {};
    if (info.sort) order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10),
      size: info.limit,
      keyword: info.search,
      order: order
    };

    return this.service.search(arg).then(result => {
      return {
        total: result.info.total,
        data: result.data
      };
    });
  };

  constructor(router, service) {
    this.service = service;
    this.router = router;
  }

  contextCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "detail":
        this.router.navigateToRoute("view", {
          Id: data.Id,
          Number: data.BeamNumber
        });
        break;
    }
  }
}
