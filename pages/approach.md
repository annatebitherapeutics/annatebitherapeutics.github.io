---
layout: page-fullwidth
title:  "Approach"
subheadline:  "Our approach for targeting cancer"
teaser: "Using the human innate immune system to fight cancer."
categories:
    - science
tags:
    - science
    - approach
    - info
header:
   image_fullwidth: "cell_with_ab-1600x800.jpg"
permalink: "/approach/"
---
{% assign approach = site.data.approach %}
<article class="approach-page">
    <section class="approach-hero">
        <div class="approach-container">
            <div class="approach-hero__content">
                <p class="approach-tagline">{{ approach.hero.eyebrow }}</p>
                <h1>{{ approach.hero.headline }}</h1>
                <figure class="approach-hero__visual">
                    <img src="{{ site.urlimg }}Antibody-HIIC-MOA-non-confidential.jpg" alt="Illustration of ANN platform delivering ApoL1" />
                </figure>
                <p class="lead">{{ approach.hero.summary }}</p>
                {% if approach.hero.highlights %}
                <ul class="approach-highlight-list">
                    {% for item in approach.hero.highlights %}
                    <li>{{ item }}</li>
                    {% endfor %}
                </ul>
                {% endif %}
            </div>
        </div>
    </section>

    <section class="approach-section approach-section--media">
        <div class="approach-container">
            <div class="approach-media">
                <div class="approach-media__copy">
                    <h2>{{ approach.video.title }}</h2>
                    <p>{{ approach.video.description }}</p>
                </div>
                <div class="approach-media__embed">
                    <div class="flex-video widescreen">
                        <iframe width="560" height="315" src="https://www.youtube.com/embed/{{ approach.video.youtube_id }}?rel=0" title="Annate Bitherapeutics video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="approach-section approach-section--mission">
        <div class="approach-container">
            <div class="approach-card">
                <h2>{{ approach.mission.title }}</h2>
                <p>{{ approach.mission.narrative }}</p>
            </div>
            {% if approach.pillars %}
            <div class="approach-grid approach-grid--pillars">
                {% for pillar in approach.pillars %}
                <div class="approach-tile">
                    <h3>{{ pillar.title }}</h3>
                    <p>{{ pillar.description }}</p>
                </div>
                {% endfor %}
            </div>
            {% endif %}
        </div>
    </section>

    <section class="approach-section approach-section--workflow">
        <div class="approach-container">
            <div class="approach-section__header">
                <h2>{{ approach.workflow.title }}</h2>
                <p>{{ approach.workflow.note }}</p>
            </div>
            <ol class="approach-workflow">
                {% for step in approach.workflow.steps %}
                <li>
                    <span class="approach-workflow__stage">{{ step.stage }}</span>
                    <p>{{ step.detail }}</p>
                </li>
                {% endfor %}
            </ol>
        </div>
    </section>

    <section class="approach-section approach-section--impact">
        <div class="approach-container">
            <h2>{{ approach.impact.title }}</h2>
            <div class="approach-grid approach-grid--impact">
                {% for stat in approach.impact.stats %}
                <div class="approach-impact-card">
                    <span class="approach-impact-card__label">{{ stat.label }}</span>
                    <p>{{ stat.detail }}</p>
                </div>
                {% endfor %}
            </div>
        </div>
    </section>

    <section class="approach-section approach-section--resources">
        <div class="approach-container">
            <h3>{{ approach.resources.title }}</h3>
            <ul class="approach-resource-list">
                {% for item in approach.resources.items %}
                <li>
                    <a href="{{ item.url }}">{{ item.label }}</a>
                </li>
                {% endfor %}
            </ul>
        </div>
    </section>
</article>
