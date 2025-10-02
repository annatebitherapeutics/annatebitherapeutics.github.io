---
layout: page-fullwidth
title:  "About Us"
subheadline:  "Our History"
categories:
    - milestones
tags:
    - science
    - about
    - milestones
permalink: "/about/"
header:
   image_fullwidth: "cell_with_ab-1600x800.jpg"
---

<div class="panel mission-panel">
    <h3>{{ site.data.content.mission.title }}</h3>
    {% assign paragraphs = site.data.content.mission.description | replace: '\n\n', '||' | split: '||' %}
    {% for paragraph in paragraphs %}
        {% if paragraph.size > 0 %}
            <p>{{ paragraph | newline_to_br }}</p>
        {% endif %}
    {% endfor %}
</div>

<ul class="timeline">
{% for event in site.data.milestones.events %}
    {% assign is_even = forloop.index0 | modulo: 2 %}
    
    {% if is_even == 0 %}
    <li>
    {% else %}
    <li class="timeline-inverted">
    {% endif %}
        <div class="timeline-image">
            <img src="{{ site.urlimg }}{{ event.image}}" class="img-responsive img-circle" alt="" />
        </div>
        <div class="timeline-panel">
            <div class="timeline-heading">
                <h4>{{ event.date }}</h4>
                <h4 class="subheading">{{ event.title }}</h4>
            </div>
            <div class="timeline-body">
                <p class="text-muted">{{ event.description }}</p>
            </div>
        </div>
    </li>
{% endfor %}
</ul>



<div class="mission-summary b30">
    <p class="text-left">
        {{ site.data.content.mission.short_description }}
    </p>
</div>
