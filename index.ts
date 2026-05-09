import { defineExtension } from "@unbrained/pm-cli/sdk";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Settings ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  id_prefix: "sprint-",
  governance: {
    preset: "default",
    ownership_enforcement: "warn",
    create_mode_default: "progressive",
    close_validation_default: "warn",
    metadata_profile: "core",
  },
  search: { mode: "keyword" },
  calendar: { default_view: "week", first_day_of_week: 1 },
  telemetry: { enabled: false },
};

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATE_BUG = {
  name: "bug",
  type: "Issue",
  priority: "high",
  tags: ["bug"],
  meta: {
    sprint: "",
    severity: "",
    environment: "",
    steps_to_reproduce: "",
    expected_behavior: "",
    actual_behavior: "",
    assignee: "",
    pr_link: "",
  },
};

const TEMPLATE_EPIC = {
  name: "epic",
  type: "Epic",
  priority: "medium",
  tags: ["epic"],
  meta: {
    objective: "",
    success_criteria: "",
    target_quarter: "",
    stakeholder: "",
    estimated_sprints: "",
  },
};

const TEMPLATE_FEATURE = {
  name: "feature",
  type: "Feature",
  priority: "medium",
  tags: ["feature"],
  meta: {
    sprint: "",
    acceptance_criteria: "",
    design_link: "",
    story_points: "",
    reviewer: "",
  },
};

const TEMPLATE_TASK = {
  name: "task",
  type: "Task",
  priority: "medium",
  tags: ["task"],
  meta: {
    sprint: "",
    estimate_hours: "",
    assignee: "",
    pr_link: "",
    blocked_by: "",
  },
};

const TEMPLATES: Record<string, object> = {
  "bug.json": TEMPLATE_BUG,
  "epic.json": TEMPLATE_EPIC,
  "feature.json": TEMPLATE_FEATURE,
  "task.json": TEMPLATE_TASK,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function writeJsonFile(filePath: string, data: object, dryRun: boolean): void {
  if (dryRun) {
    console.log(`  [dry-run] Would write: ${filePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ─── Extension ───────────────────────────────────────────────────────────────

export default defineExtension({
  name: "pm-preset-software-sprint",

  commands: [
    {
      name: "sprint-setup",
      description:
        "Apply the software-sprint preset to the current pm workspace (settings + templates).",

      flags: [
        {
          name: "force",
          short: "f",
          type: "boolean",
          description: "Overwrite existing settings.json and template files.",
          default: false,
        },
        {
          name: "dry-run",
          short: "n",
          type: "boolean",
          description: "Preview what would be written without making changes.",
          default: false,
        },
        {
          name: "prefix",
          short: "p",
          type: "string",
          description:
            'Override the id_prefix written to settings.json (default: "sprint-").',
        },
      ],

      async run({ flags, cwd }: { flags: Record<string, unknown>; cwd: string }) {
        const force = flags["force"] as boolean;
        const dryRun = flags["dry-run"] as boolean;
        const prefixOverride = flags["prefix"] as string | undefined;

        const pmDir = path.join(cwd, ".agents", "pm");
        const settingsPath = path.join(pmDir, "settings.json");
        const templatesDir = path.join(pmDir, "templates");

        // ── Step 1: verify pm workspace exists ──────────────────────────────
        if (!fs.existsSync(pmDir)) {
          console.error(
            "Error: .agents/pm/ directory not found.\n" +
              "Run `pm init` first to initialise a pm workspace, then re-run `pm sprint-setup`."
          );
          process.exitCode = 1;
          return;
        }

        console.log(
          dryRun
            ? "Dry-run mode — no files will be written.\n"
            : "Applying software-sprint preset...\n"
        );

        // ── Step 2: write settings.json ──────────────────────────────────────
        if (fs.existsSync(settingsPath) && !force) {
          console.warn(
            `Warning: ${settingsPath} already exists. Use --force to overwrite.`
          );
        } else {
          const settings = {
            ...DEFAULT_SETTINGS,
            ...(prefixOverride !== undefined
              ? { id_prefix: prefixOverride }
              : {}),
          };
          writeJsonFile(settingsPath, settings, dryRun);
          if (!dryRun) {
            console.log(`  Wrote settings.json (id_prefix: "${settings.id_prefix}")`);
          }
        }

        // ── Step 3: write templates ──────────────────────────────────────────
        for (const [filename, template] of Object.entries(TEMPLATES)) {
          const templatePath = path.join(templatesDir, filename);

          if (fs.existsSync(templatePath) && !force) {
            console.warn(
              `Warning: ${templatePath} already exists. Use --force to overwrite.`
            );
            continue;
          }

          writeJsonFile(templatePath, template, dryRun);
          if (!dryRun) {
            console.log(`  Wrote templates/${filename}`);
          }
        }

        // ── Step 4: next-steps ───────────────────────────────────────────────
        if (!dryRun) {
          console.log(`
Setup complete!

Next steps:
  • Create your first bug:     pm create --template bug
  • Create a feature:          pm create --template feature
  • Create a sprint epic:      pm create --template epic
  • Create a task:             pm create --template task
  • View your workspace:       pm ls
  • Open the calendar:         pm calendar

Tip: items created with this preset use the "${
            prefixOverride ?? DEFAULT_SETTINGS.id_prefix
          }" id prefix.
`);
        } else {
          console.log(`
[dry-run] The following would be written:
  ${settingsPath}
  ${path.join(templatesDir, "bug.json")}
  ${path.join(templatesDir, "epic.json")}
  ${path.join(templatesDir, "feature.json")}
  ${path.join(templatesDir, "task.json")}

Re-run without --dry-run to apply.
`);
        }
      },
    },
  ],
});
