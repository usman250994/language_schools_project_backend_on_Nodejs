#!/usr/bin/env bash

if [[ "$NODE_ENV" == "development" ]]; then
  ./wait-for-it.sh $DB_HOST:$DB_PORT

  npm typeorm schema:sync
  if [ $? -ne 0 ]; then
    echo "Database sync failed :("
    exit 1
  fi

  npm typeorm migration:run
  if [ $? -ne 0 ]; then
    echo "Migration failed :("
    exit 1
  fi
fi

eval "$@"
