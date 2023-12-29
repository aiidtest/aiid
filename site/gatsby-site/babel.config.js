module.exports = function (api) {
    api.cache(true);

    const config = {
        plugins: [
            [
                "@babel/plugin-proposal-decorators",
                {
                    legacy: true
                }
            ],
        ],
        presets: [
            [
                "babel-preset-gatsby",
                {
                    targets: {
                        browsers: [">0.25%", "not dead"]
                    }
                }
            ],
        ],
    };

    if (process.env.INSTRUMENT) {

        config.plugins.push([
            "babel-plugin-istanbul",
            {
                "include": [
                    "src/**/*.js"
                ]
            }
        ]);
    }

    return config;
};
