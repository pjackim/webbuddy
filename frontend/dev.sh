#!/bin/bash

LOG_FILE="dev_live_output.log"
MAX_LINES=250

# Start bun run dev and process its output
bun run dev 2>&1 | tee >( while read -r line; do
    # Append the new line to the log file
    echo "$line" >> "$LOG_FILE"

    # Trim the file to the last MAX_LINES lines
    tail -n "$MAX_LINES" "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
done )
