import { inject, bindable, containerless, computedFrom, BindingEngine } from "aurelia-framework";
import { Service, PurchasingService } from "./service";

const UnitLoader = require('../../../loader/garment-units-loader');
const StorageLoader = require('../../../loader/storage-loader');
const UnitDOLoader = require('../../../loader/garment-unit-delivery-order-loader');

@inject(BindingEngine, Service, PurchasingService)
export class DataForm {
    @bindable readOnly;
    @bindable isCreate = false;
    @bindable isEdit = false;
    @bindable isView = false;
    @bindable title;
    @bindable data = {};
    @bindable options = {};
    @bindable error;
    @bindable tittle;
    // @bindable error = {};
    @bindable filterByUnit;
    @bindable selectedUnitDO;
    @bindable Unit;
    @bindable Storages;
    @bindable itemOptions = {};

    constructor(bindingEngine, service, purchasingService) {
        this.service = service;
        this.purchasingService = purchasingService;
        this.BindingEngine = bindingEngine;
    }

    controlOptions = {
        label: {
            length: 2
        },
        control: {
            length: 5
        }
    };

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah"
    };

    itemsColumns = [""];

    bind(context) {
        var storageTempId = 0;
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.data.ReturnType = "RETUR";
        this.itemOptions = {
            isCreate : this.context.isCreate,
            isEdit: this.context.isEdit,
        }
        if (this.data.DRNo && this.data.Items) {
            this.Storages = {};
            this.Storages._id = this.data.Storage.Id;
            this.Storages.name = this.data.Storage.Name;
            this.Storages.code = this.data.Storage.Code;
            this.Unit = this.data.Unit;
            
            
            this.selectedUnitDO = {
                        UnitDONo: this.data.UnitDONo
                    };
            this.data.Items.forEach(
                item => item.IsSave = true,
            );
        }
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    storageView = (storage) => {
        return `${storage.code} - ${storage.name}`;
    }

    get unitLoader() {
        return UnitLoader;
    }

    get storageLoader() {
        return StorageLoader;
    }

    get unitDOLoader() {
        return UnitDOLoader;
    }

    async UnitChanged(newValue){
        if(!newValue){
            this.context.UnitViewModel.editorValue = "";
            this.Storages = null;
            this.selectedUnitDO = null;
            this.data.RONo = null;
            this.data.Article = null;
            this.data.ReturnDate = null;
            this.data.UENId = null;
            this.data.UnitDOId = null;
            this.data.UnitDONo = null;
            this.data.PreparingId = null;
            this.data.Items = [];
        } else if(newValue != this.data.Unit && this.context.isCreate){
            this.data.Unit = newValue;
            this.context.StorageViewModel.editorValue = "";
            this.filterByUnit = {UnitId: this.data.Unit.Id};
            this.Storages = null;
            this.data.Storage = null;
            this.selectedUnitDO = null;
            this.data.RONo = null;
            this.data.Article = null;
            this.data.ReturnDate = null;
            this.data.UENId = null;
            this.data.UnitDOId = null;
            this.data.UnitDONo = null;
            this.data.PreparingId = null;
            this.data.Items = [];
        }
    }

    async StoragesChanged(newValue){
        if(!newValue){
            this.context.StorageViewModel.editorValue = "";
            this.selectedUnitDO = null;
            this.data.RONo = null;
            this.data.Article = null;
            this.data.ReturnDate = null;
            this.data.UENId = null;
            this.data.UnitDOId = null;
            this.data.UnitDONo = null;
            this.data.PreparingId = null;
            this.data.Items = [];
        } else if(newValue && this.context.isCreate){
            this.data.Storage = {};
            this.data.Storage.Id = newValue._id;
            this.data.Storage.Name = newValue.name;
            this.data.Storage.Code = newValue.code;
            this.context.selectedUnitDOViewModel.editorValue = "";
            this.selectedUnitDO = null;
            this.data.RONo = null;
            this.data.Article = null;
            this.data.ReturnDate = null;
            this.data.UENId = null;
            this.data.UnitDOId = null;
            this.data.UnitDONo = null;
            this.data.PreparingId = null;
            this.data.Items = [];
        }
    }

    async selectedUnitDOChanged(newValue){
        if(!newValue && this.context.isCreate) {
            this.context.selectedUnitDOViewModel.editorValue = "";
            this.data.RONo = null;
            this.data.Article = null;
            this.data.ReturnDate = null;
            this.data.UENId = null;
            this.data.UnitDOId = null;
            this.data.UnitDONo = null;
            this.data.PreparingId = null;
            this.data.Items = [];
        } else if(newValue.Id && this.context.isCreate) {
            this.data.Items.splice(0);
            this.data.RONo = newValue.RONo;
            this.data.Article = newValue.Article;
            this.data.ReturnDate = new Date();
            let dataExpenditure = await this.purchasingService.getExpenditureNote({size: 1, filter : JSON.stringify({UnitDONo : newValue.UnitDONo})});
            let dataPreparing = await this.service.getPreparingByUENNo({size: 1, filter : JSON.stringify({UENNo : dataExpenditure.data[0].UENNo})});
            this.data.UENId = dataExpenditure.data[0].Id;
            this.data.UnitDOId = newValue.Id;
            this.data.UnitDONo = newValue.UnitDONo;

            if(dataPreparing.data.length>0){
                this.data.PreparingId = dataPreparing.data[0].Id;
                for(var itemUnitDO of newValue.Items){
                    for(var item of dataExpenditure.data[0].Items){
                        var qty = 0;
                        var preparingItemId = null;
                        var RemainingQuantityPreparingItem = 0;
                        var QuantityUENItem = 0;
                        for(var itemPreparing of dataPreparing.data[0].Items){
                            if(itemPreparing.UENItemId==item.Id){
                                preparingItemId = itemPreparing.Id;
                                RemainingQuantityPreparingItem = itemPreparing.RemainingQuantity;
                                QuantityUENItem = item.Quantity;
                                if(item.ProductName == "FABRIC"){
                                    qty = itemPreparing.RemainingQuantity
                                } else {
                                    qty = item.Quantity;
                                }
                            }
                        }
                        var product = {};
                        var uom = {};
                        var designColor = "";
                        product.Id = item.ProductId;
                        product.Code = item.ProductCode;
                        product.Name = item.ProductName;
                        uom.Id = item.UomId;
                        uom.Unit = item.UomUnit;
                        if(itemUnitDO.ProductCode == item.ProductCode){
                            var items = {
                                Product : product,
                                DesignColor : itemUnitDO.DesignColor,
                                RONo : item.RONo,
                                Quantity : qty,
                                Uom : uom,
                                UnitDOItemId : itemUnitDO.Id,
                                UENItemId : item.Id,
                                PreparingItemId : preparingItemId,
                                QuantityUENItem : qty,
                                RemainingQuantityPreparingItem : qty,
                            }
                            this.data.Items.push(items);
                        }
                    }
                }
            }
        } 
        else {
            let dataExpenditure = await this.purchasingService.getExpenditureNote({size: 1, filter : JSON.stringify({UnitDONo : newValue.UnitDONo})});
            let dataPreparing = await this.service.getPreparingByUENNo({size: 1, filter : JSON.stringify({UENNo : dataExpenditure.data[0].UENNo})});
            for(var dataItem of this.data.Items){
                for(var itemExpenditure of dataExpenditure.data[0].Items){
                    if(dataItem.Product.Code == itemExpenditure.ProductCode){
                        for(var itemPreparing of dataPreparing.data[0].Items){
                            if(itemPreparing.UENItemId == itemExpenditure.Id){
                                dataItem.RemainingQuantityPreparingItem = itemPreparing.RemainingQuantity;
                                dataItem.QuantityUENItem = itemExpenditure.Quantity;
                            }
                        }
                    }
                }
            }
            
        }
    }

    itemsInfo = {
        columns: [
            "Kode Barang",
            "Nama Barang",
            "Keterangan Barang",
            "RO Asal",
            "Jumlah",
            "Satuan",
        ]
    }
}