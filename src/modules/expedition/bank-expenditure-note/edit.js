import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Dialog } from '../../../components/dialog/dialog'

import Service from './service';


@inject(Router, Service, Dialog)
export class Edit {

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    formOptions = {
        cancelText: 'Kembali',
        saveText: 'Simpan',
    };

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;

        this.collection = {
            columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'Total Harga (DPP + PPN)', 'Mata Uang', ''],
        };
    }

    bind() {
        this.error = {};
    }

    UPOResults = [];
    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);

        this.UPOResults = this.data.Details.map((detail) => {
            detail.Select = true;
            return detail;
        });

        let arg = {
            page: 1,
            size: Number.MAX_SAFE_INTEGER,
            filter: this.data.Supplier && this.data.Supplier.code ? JSON.stringify({ "Position": 7, "Currency": this.data.Bank.currency.code, "SupplierCode": this.data.Supplier.code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": this.data.Bank.currency.code, "IsPaid": false }) //CASHIER DIVISION
        };

        let newData = await this.service.searchAllByPosition(arg)
            .then((result) => {
                let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

                return resultData;
            });

        if (newData.length > 0) {
            this.UPOResults = this.UPOResults.concat(newData);
        }
    }

    cancelCallback(event) {
        this.router.navigateToRoute('view', { id: this.data.Id });
    }

    saveCallback(event) {
        this.data.Details = this.UPOResults.filter((detail) => detail.Select);
        var dataPrep = this.data;
        this.dialog.prompt("Apakah anda yakin akan menyimpan data?", "Simpan Data")
            .then(response => {
                if (response == "ok") {
                    this.service.update(this.data).then(result => {
                        var creditorAccounts = [];

                        for (var item of dataPrep.Details) {
                            var creditorAccount = {
                                Id: this.data.Id,
                                Mutation: item.TotalPaid,
                                Code: this.data.DocumentNo,
                                SupplierCode: this.data.Supplier.code,
                                SupplierName: this.data.Supplier.name,
                                InvoiceNo: item.InvoiceNo,
                                Date: this.data.Date
                            };
                            creditorAccounts.push(creditorAccount);
                        }

                        this.service.updateCreditorAccount(creditorAccounts)
                            .then(result => {
                                this.cancelCallback();
                            })
                            .catch(e => {
                                this.error = e;
                            });

                    }).catch(e => {
                        this.error = e;
                    })
                }
            });
    }

    get grandTotal() {
        let result = 0;
        if (this.UPOResults && this.UPOResults.length > 0) {
            for (let detail of this.UPOResults) {
                if (detail.Select)
                    result += detail.TotalPaid;
            }
        }
        this.data.GrandTotal = result;
        return result;
    }

    onCheckAll(event) {
        for (var item of this.UPOResults) {
            item.Select = event.detail.target.checked;
        }
    }
}
