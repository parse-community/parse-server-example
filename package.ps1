"Install production node_modules"
npm i --production

"Cleaning node_modules"
$path = "node_modules"
Get-ChildItem -Path $path -Recurse | where {$_.PSIsContainer} | Where-Object {$_.Name -match '^(tests?|samples|docs?|obj|typings|examples?|jsdoc)$'} | Remove-Item -Recurse -Verbose
Get-ChildItem -Path $path -Recurse | where {!$_.PSIsContainer} | Where-Object {$_.Name -match '\.(coffee|md|png|jpg|pdb|travis\.yml|gitignore|npmignore|d\.ts)$'} | Remove-Item -Recurse -Verbose
Get-ChildItem -Path $path -Recurse | where {!$_.PSIsContainer} | Where-Object {$_.Name -match '\.*(example).*$'} | Remove-Item -Recurse -Verbose

function ZipFiles( $zipfilename, $sourcedir )
{
    "Packing ${zipfilename} from ${sourcedir}"
   Add-Type -Assembly System.IO.Compression.FileSystem
   $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
   [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcedir,
        $zipfilename, $compressionLevel, $false)
}

$zipFile = "${PSScriptRoot}\node_modules.zip"
Remove-Item $zipFile -Force
ZipFiles $zipFile "${PSScriptRoot}\${path}"
