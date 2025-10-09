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
<img src="{{ site.urlimg }}Antibody-HIIC-MOA-non-confidential.jpg" alt="" />

<div class="panel mission-panel">

<h3>{{ approach.intro }}</h3>
<ul>
{% for point in approach.points %}
<li>{{ point }}</li>
{% endfor %}
</ul>

</div>
https://youtu.be/twCfDKxUaDE
<article itemprop="video" itemscope itemtype="http://schema.org/VideoObject">
    <div class="flex-video">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/ullCwHLn6MQ?si=Atv9BgW4zOmt5-3k&rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
</article>
