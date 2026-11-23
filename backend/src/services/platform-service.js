const { AppError } = require('../utils/errors');
const { createAlertEngine } = require('../alerts/alert-engine');

function createPlatformService(repository, thresholds) {
  const alertEngine = createAlertEngine(repository, thresholds);
  return {
    async listMerchants(query) { return repository.listMerchants(query); },
    async getMerchant(id) {
      const merchant = await repository.getMerchant(id);
      if (!merchant) throw new AppError(404, 'MERCHANT_NOT_FOUND', 'Merchant not found');
      return merchant;
    },
    async listTransactions(query) { return repository.listTransactions(query); },
    async dashboardSummary() { return repository.dashboardSummary(); },
    async revenueSeries(query) { return repository.revenueSeries(query); },
    async subscriberSeries() { return repository.subscriberSeries(); },
    async alerts() { return alertEngine.listAlerts(); },
    async fraudSummary() { return repository.fraudSummary(); }
  };
}

module.exports = { createPlatformService };
