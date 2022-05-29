rmdir /s /q "manifest\\packages"
call  npm run oclif:build 
.\bin\dev package:new -n="Test Package"