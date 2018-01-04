/**
 * Created by bhavyaagg on 02/01/18.
 */

const models = require('./../db/models');

function addPartyMaster(event, data) {
  models.PartyMaster.create(data)
    .then(partyMaster => {

      event.sender.send('addedPartyMaster', {
        success: true
      });
    })
    .catch(function (err) {
      event.sender.send('addedPartyMaster', {
        success: false,
        error: err
      })
    });
}

function viewPartyMaster(event) {
  models.PartyMaster.findAll({})
    .then(function (rows) {

      event.sender.send('getPartyMaster', {
        success: true,
        partyMasterRows: rows.map((v) => v.get())
      });
    }).catch(function (err) {
    event.sender.send('getPartyMaster', {
      success: false,
      error: err
    });
  })
}

function addPaymentForPartyMaster(event, data) {
  models.PartyMaster.find({
    where: {
      id: data.partyMasterId
    }
  }).then(function (partymaster) {
    if (partymaster) {
      let partyMasterBalance = +(partymaster.get().balance);
      models.Ledger.create({
        description: data.description,
        dateOfTransaction: data.transactionDate,
        credit: 0,
        productCategoryName: "",
        debit: data.amount,
        balance: partyMasterBalance - data.amount
      }).then(function (rows) {
        partymaster.update({
          balance: partyMasterBalance - data.amount
        }).then(function (row) {
          event.sender.send('addedPaymentForPartyMaster', {
            success: true
          })
        })
      })
    } else {
      event.sender.send('addedPaymentForPartyMaster', {
        success: false,
        error: "Party Master Does Not Exists."
      })
    }
  }).catch(function () {
    event.sender.send('addedPaymentForPartyMaster', {
      success: false,
      error: "Server Error."
    })
  })
}

module.exports = exports = {
  addPartyMaster,
  viewPartyMaster,
  addPaymentForPartyMaster
};