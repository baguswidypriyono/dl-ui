import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class View {
    isView = true

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
        this.deliveryOrder = { doNo:this.data.DONo};
        this.data.IncomeTax.toString = function () {
            return [this.Name, this.Rate]
                .filter((item, index) => {
                    return item && item.toString().trim().length > 0;
                }).join(" - ");
        }
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }
}
