require "minitest/autorun"
require "nokogiri"
require "pathname"
require "yaml"

ROOT_DIR = Pathname(__dir__).join("..").expand_path
SITE_DIR = ROOT_DIR.join("_site")
MILESTONES = YAML.safe_load(ROOT_DIR.join("_data/milestones.yml").read)

class FrontpageTest < Minitest::Test
  def setup
    @index_path = SITE_DIR.join("index.html")
    @doc = Nokogiri::HTML(@index_path.read)
  end

  def test_site_build_output_exists
    assert @index_path.file?, "Expected #{relative(@index_path)} to exist after build"
    refute @index_path.zero?, "Expected #{relative(@index_path)} to have content"
  end

  def test_primary_sections_present
    %w[hero news approach pipeline team about].each do |section_id|
      assert @doc.at_css("##{section_id}"), "Expected section ##{section_id} to render"
    end
  end

  def test_navigation_points_to_frontpage_sections
    %w[approach pipeline team news about].each do |anchor|
      direct = @doc.at_css(%(nav a[href$="##{anchor}"]))
      contains = @doc.at_css(%(nav a[href*="##{anchor}"]))
      assert direct || contains, "Expected nav link to include ##{anchor}"
    end
  end

  def test_pipeline_programs_listed
    programs = @doc.css("#pipeline .front-pipeline-list li")
    assert programs.any?, "Expected at least one pipeline program to be listed"
  end

  def test_news_section_has_featured_layout
    cards = @doc.css("#news .front-card--news")
    assert cards.any?, "Expected at least one news card on the front page"
    assert_operator cards.size, :<=, 4, "Expected no more than 4 news cards on the front page"
    assert @doc.at_css("#news .front-card--featured"), "Expected a featured news card spanning the width"
  end

  def test_about_timeline_matches_milestones
    events = @doc.css("#about .timeline li")
    expected = MILESTONES.fetch("events", []).size
    assert_equal expected, events.size, "Expected #{expected} milestones in timeline"
  end

  def test_custom_styles_compiled
    css_path = SITE_DIR.join("assets/css/styles_feeling_responsive.css")
    assert css_path.file?, "Expected compiled stylesheet at #{relative(css_path)}"
    css = css_path.read
    %w[.front-hero .front-card .front-card--featured .front-news-grid--featured .front-team-grid .front-about].each do |selector|
      assert_includes css, selector, "Expected compiled CSS to include #{selector}"
    end
  end

  private

  def relative(path)
    path.relative_path_from(ROOT_DIR)
  end
end
