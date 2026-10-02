```javascript
/* =========================================
   LOAD SAVED DATA
========================================= */

let inventory =
    JSON.parse(
        localStorage.getItem("inventoryData")
    ) || [];


let withdrawals =
    JSON.parse(
        localStorage.getItem("withdrawalHistory")
    ) || [];


/* =========================================
   SAVE DATA
========================================= */

function saveData() {

    localStorage.setItem(
        "inventoryData",
        JSON.stringify(inventory)
    );

    localStorage.setItem(
        "withdrawalHistory",
        JSON.stringify(withdrawals)
    );

}


/* =========================================
   STOCK STATUS
========================================= */

function getStatus(
    quantity,
    reorder,
    maxStock
) {

    quantity = Number(quantity);
    reorder = Number(reorder);
    maxStock = Number(maxStock);


    if (quantity <= reorder) {

        return {
            text: "Low Stock",
            className: "status-low"
        };

    }


    if (quantity <= maxStock * 0.70) {

        return {
            text: "Medium Stock",
            className: "status-medium"
        };

    }


    return {
        text: "Full Stock",
        className: "status-full"
    };

}


/* =========================================
   ADD NEW ITEM
========================================= */

function addItem() {

    const code =
        document
        .getElementById("itemCode")
        .value.trim();


    const name =
        document
        .getElementById("itemName")
        .value.trim();


    const quantity =
        Number(
            document
            .getElementById("quantity")
            .value
        );


    const reorder =
        Number(
            document
            .getElementById("reorderLevel")
            .value
        );


    const maxStock =
        Number(
            document
            .getElementById("maxStock")
            .value
        );


    if (
        !code ||
        !name ||
        isNaN(quantity) ||
        isNaN(reorder) ||
        isNaN(maxStock)
    ) {

        alert(
            "Please complete all fields."
        );

        return;

    }


    if (maxStock <= 0) {

        alert(
            "Maximum stock must be greater than zero."
        );

        return;

    }


    if (reorder > maxStock) {

        alert(
            "Reorder level cannot exceed maximum stock."
        );

        return;

    }


    if (quantity > maxStock) {

        alert(
            "Initial quantity cannot exceed maximum stock."
        );

        return;

    }


    const duplicate =
        inventory.some(
            item =>
            item.code.toLowerCase()
            === code.toLowerCase()
        );


    if (duplicate) {

        alert(
            "Item code already exists."
        );

        return;

    }


    inventory.push({

        code: code,

        name: name,

        quantity: quantity,

        reorder: reorder,

        maxStock: maxStock

    });


    saveData();

    clearItemForm();

    refresh();

}


/* =========================================
   ADD STOCK
========================================= */

function addStock() {

    const index =
        Number(
            document
            .getElementById("addStockItem")
            .value
        );


    const quantity =
        Number(
            document
            .getElementById("addStockQuantity")
            .value
        );


    if (
        isNaN(index) ||
        index < 0 ||
        isNaN(quantity) ||
        quantity <= 0
    ) {

        alert(
            "Select an item and enter a valid quantity."
        );

        return;

    }


    const item =
        inventory[index];


    const newQuantity =
        Number(item.quantity) +
        quantity;


    if (
        newQuantity >
        Number(item.maxStock)
    ) {

        alert(
            "Cannot exceed maximum stock of "
            + item.maxStock
        );

        return;

    }


    item.quantity =
        newQuantity;


    saveData();

    refresh();


    document
    .getElementById("addStockQuantity")
    .value = "";


    document
    .getElementById("stockSupplier")
    .value = "";


    document
    .getElementById("stockReference")
    .value = "";


    document
    .getElementById("addStockMessage")
    .innerText =
        "✓ " +
        quantity +
        " unit(s) added to " +
        item.name;

}


/* =========================================
   WITHDRAW ITEM
========================================= */

function withdrawItem() {

    const index =
        Number(
            document
            .getElementById("withdrawItem")
            .value
        );


    const quantity =
        Number(
            document
            .getElementById("withdrawQuantity")
            .value
        );


    const requester =
        document
        .getElementById("withdrawRequester")
        .value
        .trim();


    const purpose =
        document
        .getElementById("withdrawPurpose")
        .value
        .trim();


    if (
        isNaN(index) ||
        index < 0
    ) {

        alert(
            "Please select an item."
        );

        return;

    }


    if (
        isNaN(quantity) ||
        quantity <= 0
    ) {

        alert(
            "Enter a valid withdrawal quantity."
        );

        return;

    }


    const item =
        inventory[index];


    if (
        quantity >
        Number(item.quantity)
    ) {

        alert(
            "Insufficient stock.\n\n" +
            "Available: " +
            item.quantity
        );

        return;

    }


    item.quantity =
        Number(item.quantity) -
        quantity;


    withdrawals.push({

        dateTime:
            new Date().toLocaleString(),

        code:
            item.code,

        name:
            item.name,

        quantity:
            quantity,

        remaining:
            item.quantity,

        requester:
            requester || "N/A",

        purpose:
            purpose || "N/A"

    });


    saveData();

    refresh();


    document
    .getElementById("withdrawQuantity")
    .value = "";


    document
    .getElementById("withdrawRequester")
    .value = "";


    document
    .getElementById("withdrawPurpose")
    .value = "";


    document
    .getElementById("withdrawMessage")
    .innerText =
        "✓ " +
        quantity +
        " unit(s) withdrawn from " +
        item.name;


    if (
        getStatus(
            item.quantity,
            item.reorder,
            item.maxStock
        ).text === "Low Stock"
    ) {

        setTimeout(
            function() {

                alert(
                    "WARNING: " +
                    item.name +
                    " is now LOW STOCK."
                );

            },
            100
        );

    }

}


/* =========================================
   SHOW AVAILABLE STOCK
========================================= */

function showAvailableStock() {

    const index =
        Number(
            document
            .getElementById("withdrawItem")
            .value
        );


    const display =
        document
        .getElementById("availableStock");


    if (
        isNaN(index) ||
        index < 0
    ) {

        display.innerText = "0";

        return;

    }


    display.innerText =
        inventory[index].quantity;

}


/* =========================================
   DISPLAY INVENTORY
========================================= */

function displayInventory() {

    const table =
        document
        .getElementById("inventoryTable");


    const search =
        document
        .getElementById("search")
        .value
        .toLowerCase();


    table.innerHTML = "";


    inventory.forEach(
        (item, index) => {


        if (
            !item.code
            .toLowerCase()
            .includes(search)
            &&
            !item.name
            .toLowerCase()
            .includes(search)
        ) {

            return;

        }


        const status =
            getStatus(
                item.quantity,
                item.reorder,
                item.maxStock
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${index + 1}</td>

            <td>${item.code}</td>

            <td>${item.name}</td>

            <td>
                <strong>
                    ${item.quantity}
                </strong>
            </td>

            <td>${item.reorder}</td>

            <td>${item.maxStock}</td>

            <td>

                <span class="status
                    ${status.className}">

                    ${status.text}

                </span>

            </td>

            <td>

                <div class="actions">

                    <button
                        class="edit"
                        onclick="editItem(${index})">

                        Edit

                    </button>

                    <button
                        class="delete"
                        onclick="deleteItem(${index})">

                        Delete

                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);

    });


    updateDashboard();

}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    let totalQuantity = 0;

    let low = 0;

    let medium = 0;

    let full = 0;


    inventory.forEach(
        item => {

        totalQuantity +=
            Number(item.quantity);


        const status =
            getStatus(
                item.quantity,
                item.reorder,
                item.maxStock
            );


        if (
            status.text === "Low Stock"
        ) {

            low++;

        }
        else if (
            status.text === "Medium Stock"
        ) {

            medium++;

        }
        else {

            full++;

        }

    });


    document
    .getElementById("totalItems")
    .innerText =
        inventory.length;


    document
    .getElementById("totalQuantity")
    .innerText =
        totalQuantity;


    document
    .getElementById("lowStock")
    .innerText =
        low;


    document
    .getElementById("mediumStock")
    .innerText =
        medium;


    document
    .getElementById("fullStock")
    .innerText =
        full;

}


/* =========================================
   UPDATE DROPDOWNS
========================================= */

function updateDropdowns() {

    const addSelect =
        document
        .getElementById("addStockItem");


    const withdrawSelect =
        document
        .getElementById("withdrawItem");


    addSelect.innerHTML =
        '<option value="">Select Item</option>';


    withdrawSelect.innerHTML =
        '<option value="">Select Item</option>';


    inventory.forEach(
        (item, index) => {

        const option1 =
            document.createElement("option");


        option1.value = index;

        option1.textContent =
            item.code +
            " - " +
            item.name;


        addSelect.appendChild(
            option1
        );


        const option2 =
            document.createElement("option");


        option2.value = index;

        option2.textContent =
            item.code +
            " - " +
            item.name;


        withdrawSelect.appendChild(
            option2
        );

    });

}


/* =========================================
   WITHDRAWAL HISTORY
========================================= */

function displayWithdrawalHistory() {

    const table =
        document
        .getElementById("withdrawalTable");


    table.innerHTML = "";


    withdrawals
    .slice()
    .reverse()
    .forEach(
        (record, index) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${index + 1}</td>

            <td>${record.dateTime}</td>

            <td>${record.code}</td>

            <td>${record.name}</td>

            <td>${record.quantity}</td>

            <td>${record.remaining}</td>

            <td>${record.requester}</td>

            <td>${record.purpose}</td>

        `;


        table.appendChild(row);

    });

}


/* =========================================
   EDIT ITEM
========================================= */

function editItem(index) {

    const item =
        inventory[index];


    const newQuantity =
        prompt(
            "Enter new quantity:",
            item.quantity
        );


    if (
        newQuantity === null
    ) {

        return;

    }


    const quantity =
        Number(newQuantity);


    if (
        isNaN(quantity) ||
        quantity < 0
    ) {

        alert(
            "Invalid quantity."
        );

        return;

    }


    if (
        quantity > item.maxStock
    ) {

        alert(
            "Quantity cannot exceed maximum stock."
        );

        return;

    }


    item.quantity =
        quantity;


    saveData();

    refresh();

}


/* =========================================
   DELETE ITEM
========================================= */

function deleteItem(index) {

    const item =
        inventory[index];


    if (
        confirm(
            "Delete " +
            item.name +
            "?"
        )
    ) {

        inventory.splice(
            index,
            1
        );


        saveData();

        refresh();

    }

}


/* =========================================
   CLEAR ADD ITEM FORM
========================================= */

function clearItemForm() {

    document
    .getElementById("itemCode")
    .value = "";


    document
    .getElementById("itemName")
    .value = "";


    document
    .getElementById("quantity")
    .value = "";


    document
    .getElementById("reorderLevel")
    .value = "";


    document
    .getElementById("maxStock")
    .value = "";

}


/* =========================================
   EXPORT INVENTORY
========================================= */

function exportInventory() {

    if (
        inventory.length === 0
    ) {

        alert(
            "No inventory data."
        );

        return;

    }


    let csv =
        "Item Code,Item Name,Quantity,Reorder Level,Maximum Stock,Status\n";


    inventory.forEach(
        item => {

        const status =
            getStatus(
                item.quantity,
                item.reorder,
                item.maxStock
            ).text;


        csv +=
            `"${item.code}",` +
            `"${item.name}",` +
            `${item.quantity},` +
            `${item.reorder},` +
            `${item.maxStock},` +
            `"${status}"\n`;

    });


    downloadCSV(
        csv,
        "inventory_report.csv"
    );

}


/* =========================================
   EXPORT WITHDRAWALS
========================================= */

function exportWithdrawals() {

    if (
        withdrawals.length === 0
    ) {

        alert(
            "No withdrawal history."
        );

        return;

    }


    let csv =
        "Date & Time,Item Code,Item Name,Withdrawn,Remaining,Requester,Purpose\n";


    withdrawals.forEach(
        record => {

        csv +=
            `"${record.dateTime}",` +
            `"${record.code}",` +
            `"${record.name}",` +
            `${record.quantity},` +
            `${record.remaining},` +
            `"${record.requester}",` +
            `"${record.purpose}"\n`;

    });


    downloadCSV(
        csv,
        "withdrawal_history.csv"
    );

}


/* =========================================
   DOWNLOAD CSV
========================================= */

function downloadCSV(
    csv,
    filename
) {

    const blob =
        new Blob(
            [csv],
            {
                type:
                "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;


    document
    .body
    .appendChild(link);


    link.click();


    document
    .body
    .removeChild(link);


    URL.revokeObjectURL(url);

}


/* =========================================
   REFRESH EVERYTHING
========================================= */

function refresh() {

    displayInventory();

    displayWithdrawalHistory();

    updateDropdowns();

    showAvailableStock();

}


/* =========================================
   INITIAL LOAD
========================================= */

refresh();
```
