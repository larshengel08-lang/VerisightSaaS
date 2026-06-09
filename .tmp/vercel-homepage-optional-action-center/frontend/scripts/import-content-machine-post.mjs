import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const REQUIRED_POST_FIELDS = [
  'title',
  'suggested_slug',
  'meta_description',
  'focus_keyword',
  'category',
  'why_this_topic',
  'cta_type',
  'cta_label',
  'cta_target',
  'related_solution_slug',
  'generated_at',
  'source_topic',
  'status',
]

const ALLOWED_CTA_TYPES = new Set(['conversation', 'knowledge', 'soft_product', 'diagnostic'])
const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_PREFIX_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const GITHUB_API_VERSION = '2022-11-28'

function readRequiredString(record, key) {
  const value = record?.[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`)
  }

  return value.trim()
}

function quoteYamlString(value) {
  return JSON.stringify(value)
}

function currentPublishedAt() {
  return new Date().toISOString().slice(0, 10)
}

function extractBranchDate(generatedAt) {
  const branchDate = generatedAt.slice(0, 10)
  if (!DATE_PREFIX_PATTERN.test(branchDate)) {
    throw new Error('generated_at must start with a YYYY-MM-DD date.')
  }

  return branchDate
}

export function validatePackage(post, bodyMarkdown) {
  const normalizedPost = {}

  for (const key of REQUIRED_POST_FIELDS) {
    normalizedPost[key] = readRequiredString(post, key)
  }

  if (!SAFE_SLUG_PATTERN.test(normalizedPost.suggested_slug)) {
    throw new Error('suggested_slug must be a safe kebab-case slug.')
  }

  if (!ALLOWED_CTA_TYPES.has(normalizedPost.cta_type)) {
    throw new Error(`cta_type must be one of: ${Array.from(ALLOWED_CTA_TYPES).join(', ')}`)
  }

  extractBranchDate(normalizedPost.generated_at)

  const trimmedBodyMarkdown =
    typeof bodyMarkdown === 'string' ? bodyMarkdown.trim() : ''
  if (!trimmedBodyMarkdown) {
    throw new Error('Missing body markdown')
  }

  return {
    post: normalizedPost,
    bodyMarkdown: trimmedBodyMarkdown,
  }
}

export function buildMarkdownDocument(post, bodyMarkdown, options = {}) {
  const { post: validatedPost, bodyMarkdown: trimmedBodyMarkdown } = validatePackage(post, bodyMarkdown)
  const publishedAt = options.publishedAt ?? currentPublishedAt()

  if (!DATE_PREFIX_PATTERN.test(publishedAt)) {
    throw new Error('publishedAt must use the YYYY-MM-DD format.')
  }

  const frontmatterLines = [
    '---',
    `title: ${quoteYamlString(validatedPost.title)}`,
    `slug: ${quoteYamlString(validatedPost.suggested_slug)}`,
    `metaDescription: ${quoteYamlString(validatedPost.meta_description)}`,
    `focusKeyword: ${quoteYamlString(validatedPost.focus_keyword)}`,
    `category: ${quoteYamlString(validatedPost.category)}`,
    `ctaType: ${quoteYamlString(validatedPost.cta_type)}`,
    `ctaLabel: ${quoteYamlString(validatedPost.cta_label)}`,
    `ctaTarget: ${quoteYamlString(validatedPost.cta_target)}`,
    `relatedSolutionSlug: ${quoteYamlString(validatedPost.related_solution_slug)}`,
    `generatedAt: ${quoteYamlString(validatedPost.generated_at)}`,
    `publishedAt: ${quoteYamlString(publishedAt)}`,
    `whyThisTopic: ${quoteYamlString(validatedPost.why_this_topic)}`,
    `sourceTopic: ${quoteYamlString(validatedPost.source_topic)}`,
    `importStatus: ${quoteYamlString(validatedPost.status)}`,
    '---',
    '',
    trimmedBodyMarkdown,
    '',
  ]

  return frontmatterLines.join('\n')
}

export function buildImportPlan({
  packageDir,
  repoRoot,
  post,
  bodyMarkdown,
  publishedAt = currentPublishedAt(),
}) {
  const { post: validatedPost } = validatePackage(post, bodyMarkdown)
  const resolvedRepoRoot = path.resolve(repoRoot)
  const resolvedPackageDir = path.resolve(packageDir)
  const slug = validatedPost.suggested_slug
  const branchDate = extractBranchDate(validatedPost.generated_at)
  const branchName = `content-machine/${slug}-${branchDate}`
  const targetRelativePath = path.join('content', 'insights', `${slug}.md`)
  const targetPath = path.join(resolvedRepoRoot, targetRelativePath)
  const markdownDocument = buildMarkdownDocument(validatedPost, bodyMarkdown, { publishedAt })
  const commitMessage = `feat: publish insight ${slug}`
  const prTitle = `Publish insight: ${validatedPost.title}`
  const prBody = `Imported from content-machine package ${path.basename(resolvedPackageDir)}`

  return {
    repoRoot: resolvedRepoRoot,
    packageDir: resolvedPackageDir,
    targetPath,
    targetRelativePath,
    branchName,
    commitMessage,
    prTitle,
    prBody,
    markdownDocument,
  }
}

export function readPackageFromDirectory(packageDir, options = {}) {
  const { fsImpl = fs } = options
  const resolvedPackageDir = path.resolve(packageDir)
  const postPath = path.join(resolvedPackageDir, 'post.json')
  const bodyPath = path.join(resolvedPackageDir, 'body.md')

  return {
    packageDir: resolvedPackageDir,
    post: JSON.parse(fsImpl.readFileSync(postPath, 'utf8')),
    bodyMarkdown: fsImpl.readFileSync(bodyPath, 'utf8'),
  }
}

export function writeInsightDocument(plan, options = {}) {
  const { fsImpl = fs } = options
  fsImpl.mkdirSync(path.dirname(plan.targetPath), { recursive: true })
  fsImpl.writeFileSync(plan.targetPath, plan.markdownDocument, 'utf8')
  return plan.targetPath
}

export function assertCleanWorkingTree(repoRoot, options = {}) {
  const { exec = execFileSync } = options
  const statusOutput =
    exec('git', ['status', '--short'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    }) ?? ''

  if (String(statusOutput).trim().length > 0) {
    throw new Error('Refusing to publish from a dirty git worktree or index.')
  }
}

export function assertInsightTargetDoesNotExist(plan, options = {}) {
  const { fsImpl = fs } = options
  if (fsImpl.existsSync(plan.targetPath)) {
    throw new Error(`Insight markdown already exists at ${plan.targetPath}.`)
  }
}

export function getCurrentBranch(repoRoot, options = {}) {
  const { exec = execFileSync } = options
  const branchOutput =
    exec('git', ['branch', '--show-current'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    }) ?? ''

  const branchName = String(branchOutput).trim()
  if (!branchName) {
    throw new Error('Could not determine the current git branch before publishing.')
  }

  return branchName
}

export function preparePublicationBranch(plan, options = {}) {
  const { exec = execFileSync, stdio = 'inherit' } = options
  exec('git', ['switch', '-c', plan.branchName, 'main'], { cwd: plan.repoRoot, stdio })
}

export function restoreWorkingBranch(repoRoot, branchName, options = {}) {
  const { exec = execFileSync, stdio = 'inherit' } = options
  exec('git', ['switch', branchName], { cwd: repoRoot, stdio })
}

export function readGithubToken(env = process.env) {
  const token = env.GITHUB_TOKEN ?? env.GH_TOKEN
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('Set GITHUB_TOKEN or GH_TOKEN before publishing insights to GitHub.')
  }

  return token.trim()
}

export function parseGitHubRepo(remoteUrl) {
  const normalized = String(remoteUrl).trim()
  const sshMatch = /^git@github\.com:(.+?)\/(.+?)(?:\.git)?$/.exec(normalized)
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
    }
  }

  const httpsMatch = /^https:\/\/github\.com\/(.+?)\/(.+?)(?:\.git)?$/.exec(normalized)
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2],
    }
  }

  throw new Error(`Unsupported GitHub origin URL: ${normalized}`)
}

export function buildPullRequestUrl(plan, remoteUrl) {
  const { owner, repo } = parseGitHubRepo(remoteUrl)
  return `https://github.com/${owner}/${repo}/pull/new/${plan.branchName}`
}

export async function createPullRequest(plan, options = {}) {
  const { exec = execFileSync, fetchImpl = fetch, env = process.env } = options
  const token = readGithubToken(env)
  const remoteUrl =
    exec('git', ['remote', 'get-url', 'origin'], {
      cwd: plan.repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    }) ?? ''
  const { owner, repo } = parseGitHubRepo(remoteUrl)

  const response = await fetchImpl(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    },
    body: JSON.stringify({
      title: plan.prTitle,
      body: plan.prBody,
      head: plan.branchName,
      base: 'main',
    }),
  })

  if (!response.ok) {
    const failureBody = await response.text()
    throw new Error(`GitHub pull request creation failed (${response.status}): ${failureBody}`)
  }

  return response.json()
}

export async function runPublicationPlan(plan, options = {}) {
  const { exec = execFileSync, stdio = 'inherit' } = options

  exec('git', ['add', '--', plan.targetRelativePath], { cwd: plan.repoRoot, stdio })
  exec(
    'git',
    ['commit', '--only', plan.targetRelativePath, '-m', plan.commitMessage],
    { cwd: plan.repoRoot, stdio },
  )
  exec('git', ['push', '-u', 'origin', plan.branchName], { cwd: plan.repoRoot, stdio })
  const remoteUrl =
    exec('git', ['remote', 'get-url', 'origin'], {
      cwd: plan.repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    }) ?? ''

  try {
    const pullRequest = await createPullRequest(plan, options)
    return {
      mode: 'automatic',
      remoteUrl: String(remoteUrl).trim(),
      url: pullRequest?.html_url ?? buildPullRequestUrl(plan, remoteUrl),
      pullRequest,
    }
  } catch (error) {
    if (
      error instanceof Error &&
      /Set GITHUB_TOKEN or GH_TOKEN before publishing insights to GitHub\./.test(error.message)
    ) {
      return {
        mode: 'manual',
        remoteUrl: String(remoteUrl).trim(),
        url: buildPullRequestUrl(plan, remoteUrl),
        reason: error.message,
      }
    }
    throw error
  }
}

export async function importContentMachinePost(options) {
  const { packageDir, repoRoot = process.cwd(), publishedAt, fsImpl = fs, exec = execFileSync, stdio = 'inherit' } =
    options ?? {}

  if (!packageDir) {
    throw new Error('packageDir is required.')
  }

  const packageData = readPackageFromDirectory(packageDir, { fsImpl })
  const plan = buildImportPlan({
    packageDir: packageData.packageDir,
    repoRoot,
    post: packageData.post,
    bodyMarkdown: packageData.bodyMarkdown,
    publishedAt,
  })

  assertCleanWorkingTree(plan.repoRoot, { exec })
  assertInsightTargetDoesNotExist(plan, { fsImpl })
  const originalBranch = getCurrentBranch(plan.repoRoot, { exec })
  preparePublicationBranch(plan, { exec, stdio })
  writeInsightDocument(plan, { fsImpl })
  const pullRequest = await runPublicationPlan(plan, options)
  restoreWorkingBranch(plan.repoRoot, originalBranch, { exec, stdio })

  return {
    ...plan,
    originalBranch,
    pullRequest,
  }
}

export async function main(argv = process.argv.slice(2)) {
  const [packageDir] = argv
  if (!packageDir) {
    throw new Error('Usage: node import-content-machine-post.mjs <package-dir>')
  }

  return importContentMachinePost({
    packageDir,
    repoRoot: process.cwd(),
  })
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  main()
    .then((plan) => {
      if (plan?.pullRequest?.mode === 'manual') {
        console.warn(plan.pullRequest.reason)
      }
      console.log(JSON.stringify({
        branchName: plan?.branchName ?? null,
        targetPath: plan?.targetPath ?? null,
        pullRequest: plan?.pullRequest ?? null,
      }))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    })
}
