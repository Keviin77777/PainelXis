@echo off
echo ========================================
echo   CORRIGIR EXTENSOES PHP
echo ========================================
echo.

echo Localizando php.ini...
php --ini

echo.
echo INSTRUCOES:
echo 1. Abra o arquivo php.ini mostrado acima
echo 2. Procure por: ;extension=fileinfo
echo 3. Remova o ponto e virgula: extension=fileinfo
echo 4. Salve o arquivo
echo 5. Execute START.bat novamente
echo.
echo OU execute o comando abaixo para instalar temporariamente:
echo.
echo composer install --ignore-platform-reqs
echo.
pause
