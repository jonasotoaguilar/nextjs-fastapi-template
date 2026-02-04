import json
from pathlib import Path
from app.main import app
import os

from dotenv import load_dotenv

load_dotenv()

OUTPUT_FILE = os.getenv("OPENAPI_OUTPUT_FILE")


def generate_openapi_schema(output_file):
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


def remove_operation_id_tag(schema):
    """
    Removes the tag prefix from the operation IDs in the OpenAPI schema.

    This cleans up the OpenAPI operation IDs that are used by the frontend
    client generator to create the names of the functions. The modified
    schema is then returned.
    """
    for path_data in schema["paths"].values():
        for operation in path_data.values():
            tag = operation["tags"][0]
            operation_id = operation["operationId"]
            to_remove = f"{tag}-"
            new_operation_id = operation_id[len(to_remove) :]
            operation["operationId"] = new_operation_id
    return schema


if __name__ == "__main__":
    generate_openapi_schema(OUTPUT_FILE)
