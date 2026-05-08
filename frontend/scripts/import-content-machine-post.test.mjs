import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildImportPlan,
  buildMarkdownDocument,
  createPullRequest,
  importContentMachinePost,
  parseGitHubRepo,
  readGithubToken,
  validatePackage,
} from './import-content-machine-post.mjs'

const tempDirectories = []

function createTempDirectory() {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'verisight-importer-'))
  tempDirectories.push(directory)
  return directory
}

function buildPost(overrides = {}) {
  return {
    title: 'Waarom onboarding retentie vroeg voorspelt',
    suggested_slug: 'waarom-onboarding-retentie-vroeg-voorspelt',
    meta_description:
      'Lees hoe onboardingfrictie vroeg zichtbaar maakt waar medewerkers later afhaken.',
    focus_keyword: 'onboarding retentie',
    category: 'Onboarding',
    why_this_topic: 'Nieuwe instroom staat onder druk.',
    cta_type: 'soft_product',
    cta_label: 'Bekijk de Onboarding Scan',
    cta_target: '/producten/onboarding-30-60-90',
    related_solution_slug: 'medewerkersbehoud-analyse',
    generated_at: '2026-05-06T09:00:00Z',
    source_topic: 'Onboarding retentie',
    status: 'generated',
    ...overrides,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('content-machine insight importer', () => {
  it('rejects packages missing required post fields', () => {
    const post = buildPost()
    delete post.meta_description

    expect(() => validatePackage(post, 'Body')).toThrow(/meta_description/)
  })

  it('rejects packages with unsafe slugs', () => {
    expect(() =>
      validatePackage(buildPost({ suggested_slug: '../escape' }), 'Body'),
    ).toThrow(/suggested_slug/i)
  })

  it('builds markdown with the insight frontmatter contract and body', () => {
    const markdown = buildMarkdownDocument(buildPost(), '## Intro', {
      publishedAt: '2026-05-06',
    })

    expect(markdown).toContain('title: "Waarom onboarding retentie vroeg voorspelt"')
    expect(markdown).toContain('slug: "waarom-onboarding-retentie-vroeg-voorspelt"')
    expect(markdown).toContain('metaDescription: "Lees hoe onboardingfrictie vroeg zichtbaar maakt waar medewerkers later afhaken."')
    expect(markdown).toContain('publishedAt: "2026-05-06"')
    expect(markdown).toContain('whyThisTopic: "Nieuwe instroom staat onder druk."')
    expect(markdown).toContain('## Intro')
  })

  it('builds a publication plan for the insight markdown file and PR metadata', () => {
    const plan = buildImportPlan({
      packageDir: '/tmp/20260506-onboarding-retentie',
      repoRoot: '/repo/frontend',
      post: buildPost(),
      bodyMarkdown: '## Intro',
      publishedAt: '2026-05-06',
    })

    expect(plan.targetRelativePath).toBe(
      path.join('content', 'insights', 'waarom-onboarding-retentie-vroeg-voorspelt.md'),
    )
    expect(plan.branchName).toBe(
      'content-machine/waarom-onboarding-retentie-vroeg-voorspelt-2026-05-06',
    )
    expect(plan.prTitle).toBe(
      'Publish insight: Waarom onboarding retentie vroeg voorspelt',
    )
  })

  it('reads a GitHub token from supported environment variables', () => {
    expect(readGithubToken({ GITHUB_TOKEN: 'github-token' })).toBe('github-token')
    expect(readGithubToken({ GH_TOKEN: 'gh-token' })).toBe('gh-token')
    expect(() => readGithubToken({})).toThrow(/GITHUB_TOKEN or GH_TOKEN/)
  })

  it('parses GitHub repository coordinates from origin URLs', () => {
    expect(parseGitHubRepo('https://github.com/verisight/verisight-saas.git')).toEqual({
      owner: 'verisight',
      repo: 'verisight-saas',
    })
    expect(parseGitHubRepo('git@github.com:verisight/verisight-saas.git')).toEqual({
      owner: 'verisight',
      repo: 'verisight-saas',
    })
    expect(() => parseGitHubRepo('https://example.com/verisight/verisight-saas.git')).toThrow(
      /Unsupported GitHub origin URL/,
    )
  })

  it('creates a pull request through the GitHub API', async () => {
    const plan = buildImportPlan({
      packageDir: '/tmp/20260506-onboarding-retentie',
      repoRoot: '/repo/frontend',
      post: buildPost(),
      bodyMarkdown: '## Intro',
      publishedAt: '2026-05-06',
    })
    const exec = vi.fn((command, args) => {
      if (command === 'git' && args[0] === 'remote') {
        return 'https://github.com/verisight/verisight-saas.git\n'
      }

      return ''
    })
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ html_url: 'https://github.com/verisight/verisight-saas/pull/1' }),
    }))

    await createPullRequest(plan, {
      exec,
      fetchImpl,
      env: { GITHUB_TOKEN: 'github-token' },
    })

    const resolvedRepoRoot = path.resolve('/repo/frontend')
    expect(exec.mock.calls).toEqual([
      ['git', ['remote', 'get-url', 'origin'], { cwd: resolvedRepoRoot, encoding: 'utf8', stdio: 'pipe' }],
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.github.com/repos/verisight/verisight-saas/pulls')
    expect(fetchImpl.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer github-token',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({
      title: 'Publish insight: Waarom onboarding retentie vroeg voorspelt',
      body: 'Imported from content-machine package 20260506-onboarding-retentie',
      head: 'content-machine/waarom-onboarding-retentie-vroeg-voorspelt-2026-05-06',
      base: 'main',
    })
  })

  it('imports the package, writes the markdown file, and prepares git and GitHub API publication', async () => {
    const repoRoot = createTempDirectory()
    const packageDir = createTempDirectory()
    const post = buildPost()
    const bodyMarkdown = '## Intro\n\nDit is de body.'
    const exec = vi.fn((command, args) => {
      if (command === 'git' && args[0] === 'status') {
        return ''
      }
      if (command === 'git' && args[0] === 'branch') {
        return 'main\n'
      }
      if (command === 'git' && args[0] === 'remote') {
        return 'https://github.com/verisight/verisight-saas.git\n'
      }

      return undefined
    })

    mkdirSync(path.join(repoRoot, 'content', 'insights'), { recursive: true })
    writeFileSync(path.join(packageDir, 'post.json'), JSON.stringify(post, null, 2), 'utf8')
    writeFileSync(path.join(packageDir, 'body.md'), bodyMarkdown, 'utf8')

    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ html_url: 'https://github.com/verisight/verisight-saas/pull/1' }),
    }))

    const plan = await importContentMachinePost({
      packageDir,
      repoRoot,
      publishedAt: '2026-05-06',
      exec,
      fetchImpl,
      env: { GITHUB_TOKEN: 'github-token' },
    })

    const importedPath = path.join(
      repoRoot,
      'content',
      'insights',
      'waarom-onboarding-retentie-vroeg-voorspelt.md',
    )
    const importedSource = readFileSync(importedPath, 'utf8')

    expect(plan.targetPath).toBe(importedPath)
    expect(plan.originalBranch).toBe('main')
    expect(importedSource).toContain('title: "Waarom onboarding retentie vroeg voorspelt"')
    expect(importedSource).toContain('## Intro')
    expect(exec.mock.calls).toEqual([
      ['git', ['status', '--short'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
      ['git', ['branch', '--show-current'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
      ['git', ['switch', '-c', 'content-machine/waarom-onboarding-retentie-vroeg-voorspelt-2026-05-06', 'main'], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['add', '--', path.join('content', 'insights', 'waarom-onboarding-retentie-vroeg-voorspelt.md')], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['commit', '--only', path.join('content', 'insights', 'waarom-onboarding-retentie-vroeg-voorspelt.md'), '-m', 'feat: publish insight waarom-onboarding-retentie-vroeg-voorspelt'], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['push', '-u', 'origin', 'content-machine/waarom-onboarding-retentie-vroeg-voorspelt-2026-05-06'], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['remote', 'get-url', 'origin'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
      ['git', ['remote', 'get-url', 'origin'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
      ['git', ['switch', 'main'], { cwd: repoRoot, stdio: 'inherit' }],
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('treats missing GitHub token as non-blocking after a successful push', async () => {
    const repoRoot = createTempDirectory()
    const packageDir = createTempDirectory()
    const post = buildPost()
    const bodyMarkdown = '## Intro\n\nDit is de body.'
    const exec = vi.fn((command, args) => {
      if (command === 'git' && args[0] === 'status') {
        return ''
      }
      if (command === 'git' && args[0] === 'branch') {
        return 'main\n'
      }
      if (command === 'git' && args[0] === 'remote') {
        return 'https://github.com/verisight/verisight-saas.git\n'
      }

      return undefined
    })

    mkdirSync(path.join(repoRoot, 'content', 'insights'), { recursive: true })
    writeFileSync(path.join(packageDir, 'post.json'), JSON.stringify(post, null, 2), 'utf8')
    writeFileSync(path.join(packageDir, 'body.md'), bodyMarkdown, 'utf8')

    const plan = await importContentMachinePost({
      packageDir,
      repoRoot,
      publishedAt: '2026-05-06',
      exec,
      env: {},
    })

    expect(plan.pullRequest).toMatchObject({
      mode: 'manual',
      url: 'https://github.com/verisight/verisight-saas/pull/new/content-machine/waarom-onboarding-retentie-vroeg-voorspelt-2026-05-06',
    })
    expect(plan.pullRequest.reason).toMatch(/GITHUB_TOKEN or GH_TOKEN/)
    expect(plan.originalBranch).toBe('main')
    expect(exec.mock.calls).toEqual([
      ['git', ['status', '--short'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
      ['git', ['branch', '--show-current'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
      ['git', ['switch', '-c', 'content-machine/waarom-onboarding-retentie-vroeg-voorspelt-2026-05-06', 'main'], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['add', '--', path.join('content', 'insights', 'waarom-onboarding-retentie-vroeg-voorspelt.md')], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['commit', '--only', path.join('content', 'insights', 'waarom-onboarding-retentie-vroeg-voorspelt.md'), '-m', 'feat: publish insight waarom-onboarding-retentie-vroeg-voorspelt'], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['push', '-u', 'origin', 'content-machine/waarom-onboarding-retentie-vroeg-voorspelt-2026-05-06'], { cwd: repoRoot, stdio: 'inherit' }],
      ['git', ['remote', 'get-url', 'origin'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
      ['git', ['switch', 'main'], { cwd: repoRoot, stdio: 'inherit' }],
    ])
  })
  it('fails before branch setup and writing when the repo is dirty', async () => {
    const repoRoot = createTempDirectory()
    const packageDir = createTempDirectory()
    const post = buildPost()
    const bodyMarkdown = '## Intro\n\nDit is de body.'
    const exec = vi.fn((command, args) => {
      if (command === 'git' && args[0] === 'status') {
        return ' M components/marketing/site-content.ts\n'
      }

      return ''
    })

    mkdirSync(path.join(repoRoot, 'content', 'insights'), { recursive: true })
    writeFileSync(path.join(packageDir, 'post.json'), JSON.stringify(post, null, 2), 'utf8')
    writeFileSync(path.join(packageDir, 'body.md'), bodyMarkdown, 'utf8')

    await expect(
      importContentMachinePost({
        packageDir,
        repoRoot,
        publishedAt: '2026-05-06',
        exec,
      }),
    ).rejects.toThrow(/dirty/i)

    expect(exec.mock.calls).toEqual([
      ['git', ['status', '--short'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
    ])
    expect(
      existsSync(
        path.join(
          repoRoot,
          'content',
          'insights',
          'waarom-onboarding-retentie-vroeg-voorspelt.md',
        ),
      ),
    ).toBe(false)
  })

  it('fails before publication when the insight markdown file already exists', async () => {
    const repoRoot = createTempDirectory()
    const packageDir = createTempDirectory()
    const post = buildPost()
    const bodyMarkdown = '## Intro\n\nDit is de body.'
    const exec = vi.fn((command, args) => {
      if (command === 'git' && args[0] === 'status') {
        return ''
      }

      return ''
    })
    const existingInsightPath = path.join(
      repoRoot,
      'content',
      'insights',
      'waarom-onboarding-retentie-vroeg-voorspelt.md',
    )

    mkdirSync(path.dirname(existingInsightPath), { recursive: true })
    writeFileSync(existingInsightPath, 'existing insight', 'utf8')
    writeFileSync(path.join(packageDir, 'post.json'), JSON.stringify(post, null, 2), 'utf8')
    writeFileSync(path.join(packageDir, 'body.md'), bodyMarkdown, 'utf8')

    await expect(
      importContentMachinePost({
        packageDir,
        repoRoot,
        publishedAt: '2026-05-06',
        exec,
      }),
    ).rejects.toThrow(/already exists/i)

    expect(exec.mock.calls).toEqual([
      ['git', ['status', '--short'], { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' }],
    ])
    expect(readFileSync(existingInsightPath, 'utf8')).toBe('existing insight')
  })
})
