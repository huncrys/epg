#!/bin/sh

channels_changed="$(git diff --staged --name-only --diff-filter=ACMR -- 'sites/**/*.channels.xml' | sed 's| |\\ |g')"
        
if [ ! -z "$channels_changed" ]; then
    echo "npx eslint $channels_changed"
    npm run channels:lint -- $channels_changed
fi