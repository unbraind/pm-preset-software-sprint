# pm-preset-software-sprint

A [pm-cli](https://github.com/unbraind/pm-cli) extension that applies a sprint-based software development preset to a pm workspace. It writes a curated `settings.json` and installs four ready-to-use templates so teams can start tracking bugs, features, epics, and tasks immediately after running `pm init`.

## What this preset does

| Area | Value |
|---|---|
| Workflow style | Sprint-oriented (week view, Monday start) |
| Governance | Default preset — ownership warnings, progressive create mode, warn-on-close validation |
| ID prefix | `sprint-` (overridable with `--prefix`) |
| Search | Keyword mode |
| Telemetry | Disabled |
| Templates | `bug`, `epic`, `feature`, `task` |

## Install

```sh
pm extension install github.com/unbraind/pm-preset-software-sprint --project
```

The `--project` flag installs the extension for the current workspace only. Omit it to install globally.

## Usage

After installing the extension, initialise your pm workspace (if you haven't already) and then run the setup command:

```sh
pm init            # create .agents/pm/ if it doesn't exist
pm sprint-setup    # apply settings and install templates
```

### Options

| Flag | Short | Description |
|---|---|---|
| `--force` | `-f` | Overwrite existing `settings.json` and template files |
| `--dry-run` | `-n` | Preview what would be written without making any changes |
| `--prefix <str>` | `-p` | Override the `id_prefix` value written to `settings.json` |

#### Examples

```sh
# Preview what would happen
pm sprint-setup --dry-run

# Apply and overwrite any existing files
pm sprint-setup --force

# Use a custom id prefix
pm sprint-setup --prefix "acme-"

# Combine flags
pm sprint-setup --force --prefix "q3-"
```

## What gets installed

### `settings.json`

Written to `.agents/pm/settings.json`:

```json
{
  "id_prefix": "sprint-",
  "governance": {
    "preset": "default",
    "ownership_enforcement": "warn",
    "create_mode_default": "progressive",
    "close_validation_default": "warn",
    "metadata_profile": "core"
  },
  "search": { "mode": "keyword" },
  "calendar": { "default_view": "week", "first_day_of_week": 1 },
  "telemetry": { "enabled": false }
}
```

### Templates

Four templates are written to `.agents/pm/templates/`:

| File | Type | Priority | Tags | Key metadata fields |
|---|---|---|---|---|
| `bug.json` | Issue | high | `bug` | sprint, severity, environment, steps_to_reproduce, expected_behavior, actual_behavior, assignee, pr_link |
| `epic.json` | Epic | medium | `epic` | objective, success_criteria, target_quarter, stakeholder, estimated_sprints |
| `feature.json` | Feature | medium | `feature` | sprint, acceptance_criteria, design_link, story_points, reviewer |
| `task.json` | Task | medium | `task` | sprint, estimate_hours, assignee, pr_link, blocked_by |

## Next steps after setup

```sh
pm create --template bug       # file a bug
pm create --template feature   # draft a feature
pm create --template epic      # plan a sprint epic
pm create --template task      # add a task
pm ls                          # list all items
pm calendar                    # open the week view
```

## License

MIT
