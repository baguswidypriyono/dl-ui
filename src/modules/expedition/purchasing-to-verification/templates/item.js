import { bindable, inject } from 'aurelia-framework';
import moment from 'moment';
import numeral from 'numeral';
import { Service } from '../service';
const UnitPaymentOrderLoader = require('../../../../loader/unit-payment-orders-for-verification-loader');

@inject(Service)
export class Item {
    @bindable unitPaymentOrder;

    constructor(service) {
        this.service = service;
       // this.queryUPO = { Position: 6}; // PURCHASING_DIVISION
        // this.selectUPO = [
        //     'invoceNo', 'division.code', 'division.name',
        //     'supplier.code', 'supplier.name',
        //     'currency.code', 'no', 'date', 'dueDate',
        //     'useVat', 'useIncomeTax', 'vat._id', 'vat.name', 'vat.rate',
        //     'items.unitReceiptNote.date',
        //     'items.unitReceiptNote.items.product._id',
        //     'items.unitReceiptNote.items.product.code',
        //     'items.unitReceiptNote.items.product.name',
        //     'items.unitReceiptNote.items.deliveredQuantity',
        //     'items.unitReceiptNote.items.deliveredUom.unit',
        //     'items.unitReceiptNote.items.pricePerDealUnit',
        //     'items.unitReceiptNote.items.purchaseOrder.purchaseOrderExternal.no',
        //     'items.unitReceiptNote.no',
        //     'items.unitReceiptNote.items.correction',
        // ];

        this.columns = ['Unit', 'Nama Barang', 'Jumlah', 'UOM', 'Harga'];
    }

    activate(context) {
        this.data = context.data;
        this.error = context.error;
        this.isShowing = false;

        if (this.data.no)
            this.unitPaymentOrder = { no: this.data.no };
    }

    unitPaymentOrderChanged(newV, oldV) {
        if (newV) {
            let items = [], totalPaid = 0;

            let unitReceiptsNo = newV.items.map(p => p.unitReceiptNote.no);

            let filter = {
                urnNoList: unitReceiptsNo,
                // size: Number.MAX_SAFE_INTEGER,
                // filter: JSON.stringify({ no: { $in: unitReceiptsNo } }),
                // select: ['no', 'unit._id', 'unit.code', 'unit.name']
            };

            this.service.getURN(filter)
                .then((response) => {
                    let urn = response.data;
                    console.log(urn)
                    for (let item of newV.items) {
                        let urnObj = urn.find(p => p.no === item.unitReceiptNote.no);

                        for (let detail of item.unitReceiptNote.items) {
                            let corrections = detail.correction;
                            let price, quantity;

                            // if (corrections && corrections.length !== 0) {
                            //     if (corrections[corrections.length - 1].correctionRemark === 'Koreksi Jumlah') {
                            //         let pricePerUnit = corrections[corrections.length - 1].correctionPricePerUnit;
                            //         let correctionQuantity = detail.deliveredQuantity;

                            //         for (let correction of corrections.filter(p => p.correctionRemark === 'Koreksi Jumlah')) {
                            //             correctionQuantity -= correction.correctionQuantity;
                            //         }

                            //         price = pricePerUnit * correctionQuantity;
                            //         quantity = correctionQuantity;
                            //     }
                            //     else {
                            //         price = corrections[corrections.length - 1].correctionPriceTotal;
                            //         quantity = corrections[corrections.length - 1].correctionQuantity;
                            //     }
                            // }
                            // else {
                            price = Number((detail.pricePerDealUnit * detail.deliveredQuantity).toFixed(2));
                            quantity = detail.deliveredQuantity;
                            // }

                            items.push({
                                productId: detail.product._id,
                                productCode: detail.product.code,
                                productName: detail.product.name,
                                quantity: quantity,
                                uom: detail.deliveredUom.unit,
                                price: price,
                                unitId: urnObj.unit._id,
                                unitCode: urnObj.unit.code,
                                unitName: urnObj.unit.name
                            });

                            totalPaid += price;
                        }
                    }

                    console.log(newV)
                    let vat = newV.useVat ?Number(((newV.incomeTax.rate * totalPaid) / 100).toFixed(2)) : 0;
                    let incomeTax = newV.useIncomeTax ?  Number((totalPaid * 0.1).toFixed(2)) : 0;
                    let income= newV.useIncomeTax? newV.incomeTax : null;
                    Object.assign(this.data, {
                        id: newV._id,
                        no: newV.no,
                        date: newV.date,
                        dueDate: newV.dueDate,
                        invoiceNo: newV.invoiceNo,
                        supplierCode: newV.supplier.code,
                        supplierName: newV.supplier.name,
                        divisionCode: newV.division.code,
                        divisionName: newV.division.name,
                        incomeTax: incomeTax,
                        vat: vat,
                        category:newV.category,
                        paymentMethod:newV.paymentMethod,
                        totalPaid: Number((totalPaid + vat).toFixed(2)),
                        currency: newV.currency.code,
                        items: items,
                        useIncomeTax:newV.useIncomeTax,
                        useVat:newV.useVat
                    });
                    if(newV.useIncomeTax){
                        this.data.incomeTaxId= newV.incomeTax._id ;
                        this.data.incomeTaxName= newV.incomeTax.name ;
                        this.data.incomeTaxRate= newV.incomeTax.rate;
                    }
                });
        }
        else {
            Object.assign(this.data, {
                id: undefined,
                no: undefined,
                date: undefined,
                dueDate: undefined,
                invoceNo: undefined,
                supplierCode: undefined,
                supplierName: undefined,
                divisionCode: undefined,
                divisionName: undefined,
                incomeTax: undefined,
                vat: undefined,
                incomeTaxId: undefined,
                incomeTaxName: undefined,
                incomeTaxRate: undefined,
                totalPaid: undefined,
                currency: undefined,
                category:undefined,
                details: [],
            });
        }
    }

    toggle() {
        this.isShowing = !this.isShowing;
    }

    onRemove() {
        this.bind();
    }

    get unitPaymentOrderLoader() {
        return UnitPaymentOrderLoader;
    }
}
