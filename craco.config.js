// craco.config.js
module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.module.rules = webpackConfig.module.rules.filter(
                (rule) =>
                    !(
                        rule.enforce === 'pre' &&
                        rule.use &&
                        rule.use.some(
                            (use) =>
                                use.loader && use.loader.includes('source-map-loader')
                        )
                    )
            );

            return webpackConfig;
        },
    },
};
