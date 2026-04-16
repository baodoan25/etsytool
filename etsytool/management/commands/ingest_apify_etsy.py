import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from etsytool.data_engine.apify_runner import build_run_input, run_etsy_actor
from etsytool.data_engine.storage import ingest_raw_items, write_raw_run_items


class Command(BaseCommand):
    help = "Run the configured Apify Etsy actor and ingest normalized listing records."

    def add_arguments(self, parser):
        parser.add_argument(
            "--url",
            action="append",
            dest="urls",
            default=[],
            help="Etsy URL to crawl. Can be provided multiple times.",
        )
        parser.add_argument(
            "--input-file",
            help="Text file with one Etsy URL per line.",
        )
        parser.add_argument(
            "--max-items",
            type=int,
            default=1000,
            help="Maximum Apify dataset items to request.",
        )
        parser.add_argument(
            "--end-page",
            type=int,
            default=1,
            help="Last pagination page for the actor input.",
        )
        parser.add_argument(
            "--include-description",
            action="store_true",
            help="Ask the actor to include listing descriptions.",
        )
        parser.add_argument(
            "--actor-id",
            help="Override APIFY_ETSY_ACTOR_ID for this run.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print the Apify run input without calling Apify.",
        )

    def handle(self, *args, **options):
        start_urls = list(options["urls"])

        if options.get("input_file"):
            input_path = Path(options["input_file"])

            if not input_path.exists():
                raise CommandError(f"Input file does not exist: {input_path}")

            start_urls.extend(
                line.strip()
                for line in input_path.read_text(encoding="utf-8").splitlines()
                if line.strip() and not line.strip().startswith("#")
            )

        start_urls = list(dict.fromkeys(start_urls))

        if not start_urls:
            raise CommandError("Provide at least one --url or --input-file.")

        run_input = build_run_input(
            start_urls=start_urls,
            max_items=options["max_items"],
            end_page=options["end_page"],
            include_description=options["include_description"],
        )

        if options["dry_run"]:
            self.stdout.write(json.dumps(run_input, ensure_ascii=False, indent=2))
            return

        try:
            result = run_etsy_actor(
                start_urls=start_urls,
                max_items=options["max_items"],
                end_page=options["end_page"],
                include_description=options["include_description"],
                actor_id=options.get("actor_id"),
            )
        except RuntimeError as exc:
            raise CommandError(str(exc)) from exc

        raw_path = write_raw_run_items(result["runId"], result["items"])
        ingest_result = ingest_raw_items(result["items"], source="apify")

        self.stdout.write(self.style.SUCCESS(f"Apify run completed: {result['runId']}"))
        self.stdout.write(f"Dataset: {result['datasetId']}")
        self.stdout.write(f"Raw JSONL: {raw_path}")
        self.stdout.write(f"New normalized items: {len(ingest_result['normalizedItems'])}")
        self.stdout.write(f"Total normalized items: {ingest_result['totalItems']}")
        self.stdout.write(f"Normalized store: {ingest_result['normalizedPath']}")
