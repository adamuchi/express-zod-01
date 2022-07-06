export interface Config {
    port: number;
    xrayEnabled: boolean;
}

const defaultConfig: Config = {
    port: Number(process.env.PORT || 3000),
    xrayEnabled: true,
};

const overrides: {[env: string]: Config} = {
    local: { ...defaultConfig, xrayEnabled: false }
}

const environment = process.env.ENVIRONMENT ?? 'local';
export default overrides[environment] ?? defaultConfig;
