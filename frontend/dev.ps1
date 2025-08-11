$LogFile = "bun_output.log"
$MaxLines = 500

# Run bun and capture output live
bun run dev 2>&1 | ForEach-Object {
    $_
    Add-Content -Path $LogFile -Value $_
    
    # Trim the file to last $MaxLines lines
    $lines = Get-Content $LogFile -Tail $MaxLines
    Set-Content -Path $LogFile -Value $lines
}
