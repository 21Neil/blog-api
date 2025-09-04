#!/usr/bin/env bash

URL="http://localhost:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU2ODgyNTQxLCJleHAiOjE3NTY5Njg5NDF9.QmjpXCgKboF3NJQNpWQbdRT6HzK86NWuRyk2IJJ0A8M"
CONTENT_TYPE_JSON="Content-Type: application/json"
AUTHORIZATION="Authorization: bearer $TOKEN"

login() {
  curl -X POST \
    "$URL/auth/login" \
    -H "$CONTENT_TYPE_JSON" \
    -d '
    {
      "username": "admin",
      "password": "blogadmin21"
    }'
}

get_all_posts() {
  curl "$URL/admin/posts" \
  -H "$AUTHORIZATION"
}

get_published_posts() {
  curl "$URL/posts"
}

get_post() {
  curl "$URL/posts/1"
}

create_post() {
  curl -X POST \
    "$URL/admin/posts" \
    -H "$CONTENT_TYPE_JSON" \
    -H "$AUTHORIZATION" \
    -d '
    {
      "title": "Test post",
      "content": "Test create post",
      "published": true,
      "authorId": 2
    }'
}

update_post() {
  curl -X PUT \
    "$URL/admin/posts/3" \
    -H "$CONTENT_TYPE_JSON" \
    -H "$AUTHORIZATION" \
    -d '
    { 
      "title": "Update post",
      "content": "Test update post",
      "published": true
    }'
}

delete_post() {
  curl -X DELETE \
    "$URL/admin/posts/7" \
    -H "$AUTHORIZATION"
}

create_comment() {
  curl -X POST \
    "$URL/posts/1/comments" \
    -H "$CONTENT_TYPE_JSON" \
    -d '{
      "name": "Amy",
      "content": "Wow!"
    }'
}

get_comments() {
  curl "$URL/posts/1/comments"
}

delete_comment() {
  curl -X DELETE \
    "$URL/admin/comments/3" \
    -H "$AUTHORIZATION"
}

case "$1" in 
  login)
    login | jq
    ;;
  get_all_posts)
    get_all_posts | jq
    ;;
  get_published_posts)
    get_published_posts | jq
    ;;
  get_post)
    get_post | jq
    ;;
  create_post)
    create_post | jq
    ;;
  update_post)
    update_post | jq
    ;;
  delete_post)
    delete_post | jq
    ;;
  create_comment)
    create_comment | jq
    ;;
  get_comments)
    get_comments | jq
    ;;
  delete_comment)
    delete_comment | jq
    ;;
  *)
    exit 1
    ;;
esac