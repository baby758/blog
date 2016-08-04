#!/bin/sh

if [ $# != 1 ] ; then 
echo "USAGE: sh build.sh dev or test or release" 
exit 1; 
fi 
CHANNEL=$1;

PHPMD="./vendor/bin/phpmd";

# echo $CHANNEL;

rm composer.lock

if [ $CHANNEL = "dev" ]; then

    echo "=====copy install/.env.dev to .env";
    cp install/.env.dev ./.env
    # 安装vendor
    composer install --dev -vvv;


fi;

if [ $CHANNEL = "test" ]; then

    echo "=====copy install/.env.test to .env";
    cp install/.env.test ./.env
    # 安装vendor
    composer install --dev -vvv;

fi;

if [ $CHANNEL = "release" ]; then

    echo "=====copy install/.env.release to .env";
    cp install/.env.release ./.env
    # 安装vendor
    composer install --no-dev -vvv;
fi;

# 静态代码检查
if [ -f "$PHPMD" ]; then
    $PHPMD ./app text unusedcode, codesize
fi 


# 生成app key
php artisan key:generate
# 修改目录权限
chmod -R 777 storage bootstrap/cache
# 优化自动加载
composer dump-autoload --optimize
