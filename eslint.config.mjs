import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["lib/database.types.ts", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
