/**
 * Created by bhavyaagg on 02/01/18.
 */

const models = require('./../db/models');

function submitInvoice(event, invoiceItemData) {
  models.Invoice.create(invoiceItemData)
    .then(invoiceItem => {

      models.Ledger.create({
        description: "Invoice With Slip No. " + invoiceItem.get().id + " Dated " + invoiceItemData.dateOfInvoice,
        partymasterId: invoiceItemData.partymasterId,
        dateOfTransaction: invoiceItemData.dateOfInvoice,
        credit: invoiceItemData.grandTotal,
        productCategoryName: invoiceItemData.productCategoryName,
        invoiceId: invoiceItem.get().id,
        debit: 0,
        balance: invoiceItemData.partyMasterBalance + invoiceItemData.grandTotal
      }).then(function (data) {
        models.PartyMaster.update({
          balance: invoiceItemData.partyMasterBalance + invoiceItemData.grandTotal
        }, {
          where: {
            id: invoiceItemData.partymasterId
          }
        }).then(function () {
          event.sender.send('getSubmitInvoice', {
            success: true,
            data: invoiceItem
          })
        })
      })

    }).catch(err => {
    event.sender.send('getSubmitInvoice', {
      success: false,
      error: err
    });
  })
}

function submitInvoiceDetail(event, invoiceDetail) {
  invoiceDetail.listItems.forEach(invoiceItem => {
    models.InvoiceDetail.create({
      qty: invoiceItem.qty,
      unitType: invoiceItem.per,
      invoiceId: invoiceDetail.invoiceId,
      productId: invoiceItem.productId
    }).then(function (item) {

    }).catch(function (err) {
      event.sender.send('getSubmitInvoice', {
        success: false,
        error: err
      });
    });
  });
}

function viewInvoiceItems(event) {
  models.Invoice.findAll({
    include: [models.PartyMaster, models.ProductCategory]
  })
    .then(function (invoiceItems) {
      if (invoiceItems.length > 0) {
        event.sender.send('getInvoiceItems', {
          success: true,
          invoiceItems: invoiceItems.map(invoiceItem => invoiceItem.get())
        })
      }
      else {
        event.sender.send('getInvoiceItems', {
          success: false,
          error: "No Element Found"
        })
      }
    })
    .catch(err => {
      event.sender.send('getInvoiceItems', {
        success: false,
        error: err
      });
    });
}

function deleteInvoiceItemById(event, invoiceItemId) {
  models.Invoice.destroy({
    where: {
      id: invoiceItemId.id
    }
  }).then(function (rows) {
    if (rows > 0) {
      models.InvoiceDetail.destroy({
        where: {
          invoiceId: null
        }
      }).then(function (rows) {
        if (rows > 0) {
          event.sender.send('deletedInvoiceItemById', {
            success: true,
          })
        }
        else {
          event.sender.send('deletedInvoiceItemById', {
            success: false,
            error: "Incorrect ID"
          })
        }

      }).catch(function (err) {
        console.log(err);
        event.sender.send('deletedInvoiceItemById', {
          success: false,
          error: err
        })
      })
    }
    else {
      event.sender.send('deletedInvoiceById', {
        success: false,
        error: "Incorrect ID"
      })
    }
  }).catch(function (err) {
    console.log(err);
    event.sender.send('deletedInvoiceById', {
      success: false,
      error: err
    });
  })
}

function viewInvoiceItemById(event, invoiceItemId) {
  console.log(invoiceItemId);
  models.Invoice.findAll({
    where: {
      id: invoiceItemId.id
    }
  }).then(function (invoiceItem) {
    if (invoiceItem) {
      event.sender.send('getInvoiceItemById', {
        success: true,
        invoiceItem: invoiceItem.get()
      })
    }
    else {
      event.sender.send('getInvoiceItemById', {
        success: true,
        error: "Not Found"
      })
    }
  }).catch(function (err) {
    event.sender.send('getInvoiceItemById', {
      success: true,
      error: err
    })
  })
}

function editInvoice(event, invoiceItem) {
  models.Invoice.update({
    name: product.name,
    price: product.price,
    productcategoryId: product.productCategoryId
  }, {

    where: {
      id: invoiceItem.id
    }
  }).then(function (result) {
    if (result[0] > 0) {
      event.sender.send('editedInvoiceItem', {
        success: true
      })
    } else {
      event.sender.send('editedInvoiceItem', {
        success: false,
        error: "Incorrect ID"
      })
    }
  }).catch(function (err) {
    console.log(err)
    event.sender.send('editedInvoiceItem', {
      success: false,
      error: err
    });
  })
}

module.exports = exports = {
  submitInvoice,
  submitInvoiceDetail,
  viewInvoiceItems,
  deleteInvoiceItemById,
  viewInvoiceItemById
};