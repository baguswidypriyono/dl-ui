export class Header {
    activate(context) {
        this.context = context;
        this.items = context.items;
        this.options = context.options;
        this.isEdit = context.options.isEdit;
    }

    changeCheckedAll() {
        this.items
            .forEach(item => {
                item.data.IsSave = (this.options.checkedAll === true);
            });
    }
}
