/**
 * OneAPM agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
    /**
     * Your Application name.
     */
    app_name: 'neo4j community',
    /**
     * Your tier names.
     */
    tier_name: ['nodejs'],
    /**
     * Your OneAPM license key.
     */
    license_key: 'DAAKVgMMBVF489eUFV1NWQ8eX0691aFUVUkECQNQTb938wkAFQdWHgMF5c21CghIBgocUVM=',
    logging: {
        /**
         * Level at which to log. 'trace' is most useful to OneAPM when diagnosing
         * issues with the agent, 'info' and higher will impose the least overhead on
         * production applications.
         */
        level: 'info'
    },
    transaction_events: {
        enabled: true
    }
};
