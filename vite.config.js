import Banner from 'vite-plugin-banner'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import vuePlugin from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {svgBuilder} from 'vite-auto-import-svg'
import UnoCSS from '@unocss/vite'

// @see https://cn.vitejs.dev/config/
export default ({ mode }) => {
  const NODE_ENV = mode || 'development'
  const envFiles = [`.env.${NODE_ENV}`]
  for (const file of envFiles) {
    const envConfig = dotenv.parse(fs.readFileSync(file))
    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  }

  const timestamp = Date.parse(new Date())

  // 修复：完全移除 vant 相关配置
  const optimizeDeps = {
    include: [],
    exclude: ['vant']  // 排除 vant，避免预构建时重复处理
  }

  const alias = {
    '@': path.resolve(__dirname, './src'),
    vue$: 'vue/dist/vue.runtime.esm-bundler.js'
  }

  const esbuild = {
    // 跳过 Vant 相关的转译以避免重复声明
    exclude: []
  }

  // 修复：调整输出配置
  const rollupOptions = {
    output: {
      entryFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
      chunkFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
      assetFileNames: 'assets/087AC4D233B64EB0[name].[hash].[ext]'
    }
  }

  const base = "/"
  const root = "./"
  const outDir = "dist"

  return {
    base: base,
    root: root,
    publicDir: 'public',
    resolve: {
      alias,
      dedupe: ['vue']  // 只 dedupe vue，不要 dedupe vant
    },
    define: {
      'process.env': {}
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    server: {
      open: process.env.VITE_OPEN_BROWSER === 'true' || false,
      port: process.env.VITE_CLI_PORT,
      proxy: {
        [process.env.VITE_BASE_API]: {
          target: `${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/`,
          changeOrigin: true,
          rewrite: (path) =>
              path.replace(new RegExp('^' + process.env.VITE_BASE_API), '')
        }
      }
    },
    build: {
      minify: 'terser',
      manifest: false,
      sourcemap: false,
      outDir: outDir,
      rollupOptions,
      chunkSizeWarningLimit: 1000,
      esbuildOptions: {
        drop: ['console', 'debugger']
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      }
    },
    esbuild,
    optimizeDeps,
    plugins: [
      process.env.VITE_POSITION === 'open' &&
      vueDevTools({launchEditor: process.env.VITE_EDITOR}),
      vuePlugin({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'emoji-picker'
          }
        }
      }),
      svgBuilder(['./src/plugin/', './src/assets/icons/'], base, outDir, 'assets', NODE_ENV),
      [Banner(`\n Build based on gin-vue-admin \n Time : ${timestamp}`)],
      UnoCSS()
    ]
  }
}