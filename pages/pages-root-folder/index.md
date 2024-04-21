---
#
# Use the widgets beneath and the content will be
# inserted automagically in the webpage. To make
# this work, you have to use › layout: frontpage
#
layout: frontpage
header:
   image_fullwidth: "cell_with_ab-1600x800.jpg"
widget1:
  title: "Our Approach"
  url: '/approach/'
  image: "our_approach_icon-70.png"
  text: 'More information on our approach for specific targeting and killing of cancer cells.'
widget2:
  title: "Our Team"
  url: '/team/'
  image: "our_team_icon-70.png"
  text: 'More information about our team we are building to bring this product to market.'
widget3:
  title: "Our Pipeline"
  url: '/pipeline/'
  image: "our_pipeline_icon-70.png"
  text: 'For more information on our current pipeline of products we are developing.'
#
# Use the call for action to show a button on the frontpage
#
# To make internal links, just use a permalink like this
# url: /getting-started/
#
# To style the button in different colors, use no value
# to use the main color or success, alert or secondary.
# To change colors see sass/_01_settings_colors.scss
#
callforaction:
  url: https://us18.list-manage.com/contact-form?u=fd7a9519704f573e1bf7d96b7&form_id=a86dbc3f29b93759d8e7233e2b8ce118
  text: Inform me about new updates ›
  style: alert
permalink: /index.html
#
# This is a nasty hack to make the navigation highlight
# this page as active in the topbar navigation
#
homepage: true
---


