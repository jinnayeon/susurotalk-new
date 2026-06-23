// Metro 설정 (pnpm 모노레포 지원)
// 참고: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// 1. 모노레포 전체를 watch (packages/* 워크스페이스 소스 변경 감지)
config.watchFolders = [monorepoRoot]

// 2. 앱 로컬 + 모노레포 루트 node_modules 모두에서 모듈 해석
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// 3. pnpm 심볼릭 링크를 따라가도록 설정
config.resolver.unstable_enableSymlinks = true
config.resolver.disableHierarchicalLookup = false

module.exports = config
