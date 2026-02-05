import json
import os
from pathlib import Path

from app.main import app
from dotenv import load_dotenv

from typing import Any, Dict, Optional

load_dotenv()

OUTPUT_FILE = os.getenv("OPENAPI_OUTPUT_FILE")


def generate_openapi_schema(output_file: Optional[str]) -> None:
    if not output_file:
        print("No output file specified in OPENAPI_OUTPUT_FILE env var")
        return
    schema = app.openapi()
    output_path = Path(output_file)

    updated_schema = remove_operation_id_tag(schema)

    output_path.write_text(json.dumps(updated_schema, indent=2))
    print(f"OpenAPI schema saved to {output_file}")

    # Format with biome if available
    import subprocess

    try:
        # We use --no-errors-on-unmatched to avoid failing if biome is not configured to handle json
        subprocess.run(
            ["pnpm", "biome", "format", "--write", str(output_path)],
            check=False,
            capture_output=True,
        )
        print(f"Formatted {output_file} with Biome")
    except Exception as e:
        print(f"Could not format with Biome: {e}")


def remove_operation_id_tag(schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Removes the tag prefix from the operation IDs in the OpenAPI schema.

    This cleans up the OpenAPI operation IDs that are used by the frontend
    client generator to create the names of the functions. The modified
    schema is then returned.
    """
    for path_data in schema["paths"].values():
        for operation in path_data.values():
            if (
                isinstance(operation, dict)
                and "tags" in operation
                and "operationId" in operation
            ):
                tag = operation["tags"][0]
                operation_id = operation["operationId"]
                to_remove = f"{tag}-"
                if operation_id.startswith(to_remove):
                    new_operation_id = operation_id[len(to_remove) :]
                    operation["operationId"] = new_operation_id
    return schema


if __name__ == "__main__":
    generate_openapi_schema(OUTPUT_FILE)
