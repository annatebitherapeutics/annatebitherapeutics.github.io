---
layout: page-fullwidth
title:  "Pioneering ApoL1 Targeted Therapies"
subheadline:  "Transforming Treatment Paradigms"
teaser: "Using the human innate immune system to fight cancer."
categories:
    - science
tags:
    - science
    - pipeline
    - info
permalink: "/pipeline/"
header:
   image_fullwidth: "cell_with_ab-1600x800.jpg"
---

At Annate Bitherapeutics, our mission transcends traditional medical boundaries as we innovate with ApoL1 targeted therapies, focusing on diseases desperately in need of breakthrough solutions. Our deep understanding of ApoL1 mechanisms empowers us to craft targeted treatments that not only promise new hope but also herald a new era in medical science.

With a keen focus on combating formidable adversaries like multiple myeloma and pancreatic cancer, we are at the forefront of redefining treatment landscapes. Our dedication goes beyond current challenges; we are relentlessly exploring new territories and expanding our pipeline. At Annate Bitherapeutics, we are not just developing treatments; we are shaping the future of health, aiming for nothing less than transformative outcomes.

## Current Projects

<img src="{{ site.urlimg }}2023-03-27-pipeline_white.png" alt="" />

{% for d in site.data.drugs.drug %}
{% if d.display == true %}
* [{{d.product}}, {{d.indication}}]({{ site.baseurl}}/{{ d.product | datapage_url: 'pipelinedrugs' }})
{% endif %}
{% endfor %}

* Last updated March 28th, 2024
