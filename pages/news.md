---
layout: page-fullwidth
show_meta: false
title: "News Releases"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/news/"
---
{% assign newsroom_posts = site.posts | where_exp: "post", "post.path contains '/news/'" %}
{% if newsroom_posts and newsroom_posts != empty %}
{% assign newsroom_posts = newsroom_posts | sort: "date" | reverse %}
{% assign featured_post = newsroom_posts | first %}
{% assign other_posts = newsroom_posts | slice: 1, newsroom_posts.size %}

<div class="newsroom front-section front-section--light">
    <div class="row front-section__header">
        <div class="small-12 columns">
            <h1>{{ page.title }}</h1>
            <p class="front-section__subtitle">Stories, milestones, and media highlights from Annate Bitherapeutics.</p>
        </div>
    </div>

    <div class="newsroom-feature front-news-grid front-news-grid--featured">
        <article class="front-card front-card--news front-card--featured">
            {% if featured_post.image and featured_post.image.title %}
            <figure class="front-card__figure">
                <img src="{{ site.urlimg }}{{ featured_post.image.title }}" alt="{{ featured_post.image.caption | default: featured_post.title }}">
                {% if featured_post.image.caption %}
                <figcaption class="front-card__caption">
                    {% if featured_post.image.caption_url %}
                    <a href="{{ featured_post.image.caption_url }}">{{ featured_post.image.caption }}</a>
                    {% else %}
                    {{ featured_post.image.caption }}
                    {% endif %}
                </figcaption>
                {% endif %}
            </figure>
            {% endif %}
            <p class="front-card__meta">{{ featured_post.date | date: "%B %-d, %Y" }}</p>
            <h2 class="front-card__title">
                <a href="{{ featured_post.url | relative_url }}">{{ featured_post.title }}</a>
            </h2>
            {% assign summary = featured_post.teaser | default: featured_post.excerpt %}
            {% if summary %}
            {% assign summary = summary | strip_html | strip_newlines | truncatewords: 48, "…" %}
            {% else %}
            {% assign summary = featured_post.content | strip_html | strip_newlines | truncatewords: 48, "…" %}
            {% endif %}
            <p class="front-card__body">{{ summary }}</p>
            <a class="front-card__link" href="{{ featured_post.url | relative_url }}">Read the full story →</a>
        </article>
    </div>

    {% if other_posts and other_posts != empty %}
    <div class="newsroom-grid front-news-grid front-news-grid--list">
        {% for post in other_posts %}
        <article class="front-card front-card--news">
            {% if post.image and post.image.title %}
            <figure class="front-card__figure">
                <img src="{{ site.urlimg }}{{ post.image.title }}" alt="{{ post.image.caption | default: post.title }}">
                {% if post.image.caption %}
                <figcaption class="front-card__caption">
                    {% if post.image.caption_url %}
                    <a href="{{ post.image.caption_url }}">{{ post.image.caption }}</a>
                    {% else %}
                    {{ post.image.caption }}
                    {% endif %}
                </figcaption>
                {% endif %}
            </figure>
            {% endif %}
            <p class="front-card__meta">{{ post.date | date: "%B %-d, %Y" }}</p>
            <h3 class="front-card__title">
                <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            </h3>
            {% assign summary = post.teaser | default: post.excerpt %}
            {% if summary %}
            {% assign summary = summary | strip_html | strip_newlines | truncatewords: 36, "…" %}
            {% else %}
            {% assign summary = post.content | strip_html | strip_newlines | truncatewords: 36, "…" %}
            {% endif %}
            <p class="front-card__body">{{ summary }}</p>
            <a class="front-card__link" href="{{ post.url | relative_url }}">Read more →</a>
        </article>
        {% endfor %}
    </div>
    {% endif %}
</div>
{% else %}
<div class="front-news-empty">
    <p class="front-section__empty">Check back soon for announcements from Annate Bitherapeutics.</p>
</div>
{% endif %}
