/* These queries are from the route handlers */

SELECT "user".id AS user_id, "user".name AS user_name, "user".email AS user_email, "user".password AS user_password, "user".disabled AS user_disabled, "user"."createdAt" AS "user_createdAt", "user"."updatedAt" AS "user_updatedAt", "user".org_id AS user_org_id
FROM "user" JOIN session_token ON "user".id = session_token.user_id
WHERE session_token.session_token = %(session_token_1)s -- Create Unique index on session_token
LIMIT %(param_1)s

SELECT role.id AS role_id, role.name AS role_name, role."createdAt" AS "role_createdAt", role."updatedAt" AS "role_updatedAt", anon_1.user_id AS anon_1_user_id
FROM (SELECT "user".id AS user_id
FROM "user" JOIN session_token ON "user".id = session_token.user_id
WHERE session_token.session_token = %(session_token_1)s -- Create Index for user_roles on user_id, Create Index for role on id
LIMIT %(param_1)s) AS anon_1 JOIN user_roles AS user_roles_1 ON anon_1.user_id = user_roles_1.user_id JOIN role ON role.id = user_roles_1.role_id ORDER BY anon_1.user_id

SELECT "user".id AS user_id, "user".name AS user_name, "user".email AS user_email, "user".password AS user_password, "user".disabled AS user_disabled, "user"."createdAt" AS "user_createdAt", "user"."updatedAt" AS "user_updatedAt", "user".org_id AS user_org_id, address_1.id AS address_1_id, address_1.address1 AS address_1_address1, address_1.address2 AS address_1_address2, address_1.city AS address_1_city, address_1.state AS address_1_state, address_1.country AS address_1_country, address_1.postal_code AS address_1_postal_code, address_1."createdAt" AS "address_1_createdAt", address_1."updatedAt" AS "address_1_updatedAt", organization_1.id AS organization_1_id, organization_1.name AS organization_1_name, organization_1."createdAt" AS "organization_1_createdAt", organization_1."updatedAt" AS "organization_1_updatedAt", organization_1.address_id AS organization_1_address_id, organization_1.farmable_factor AS organization_1_farmable_factor, organization_1.nonfarmable_factor AS organization_1_nonfarmable_factor, organization_1.irrigation_factor AS organization_1_irrigation_factor, organization_1.disabled AS organization_1_disabled, organization_1.primary_color AS organization_1_primary_color, organization_1.logo AS organization_1_logo
FROM "user" JOIN session_token ON "user".id = session_token.user_id LEFT OUTER JOIN organization AS organization_1 ON organization_1.id = "user".org_id LEFT OUTER JOIN address AS address_1 ON address_1.id = organization_1.address_id
WHERE session_token.session_token = %(session_token_1)s -- Create Index on Organization.id
 LIMIT %(param_1)s -- Create index on user.id and address.id



/* These queries are from getting Counties and Areas on /organization endpoint */

SELECT organization.id AS organization_id, organization.name AS organization_name, organization."createdAt" AS "organization_createdAt", organization."updatedAt" AS "organization_updatedAt", organization.address_id AS organization_address_id, organization.farmable_factor AS organization_farmable_factor, organization.nonfarmable_factor AS organization_nonfarmable_factor, organization.irrigation_factor AS organization_irrigation_factor, organization.disabled AS organization_disabled, organization.primary_color AS organization_primary_color, organization.logo AS organization_logo, address_1.id AS address_1_id, address_1.address1 AS address_1_address1, address_1.address2 AS address_1_address2, address_1.city AS address_1_city, address_1.state AS address_1_state, address_1.country AS address_1_country, address_1.postal_code AS address_1_postal_code, address_1."createdAt" AS "address_1_createdAt", address_1."updatedAt" AS "address_1_updatedAt"
FROM organization LEFT OUTER JOIN address AS address_1 ON address_1.id = organization.address_id -- index address.id

SELECT org_counties.county_id AS org_counties_county_id, org_counties.org_id AS org_counties_org_id
FROM org_counties
WHERE org_counties.org_id = %(org_id_1)s -- Index org_counties on org_id

SELECT area.id AS area_id, area.state AS area_state, area.name AS area_name, area."updatedAt" AS "area_updatedAt", area."createdAt" AS "area_createdAt", area.org_id AS area_org_id
FROM area
WHERE area.org_id = %(org_id_1)s -- Index area on org_id

SELECT county.id AS county_id, county.county AS county_county, county.state AS county_state, county."createdAt" AS "county_createdAt", county."updatedAt" AS "county_updatedAt", anon_1.area_id AS anon_1_area_id
FROM (SELECT area.id AS area_id
FROM area -- Index area_counties on area_id  and Index county on id
WHERE area.org_id = %(org_id_1)s) AS anon_1 JOIN area_counties AS area_counties_1 ON anon_1.area_id = area_counties_1.area_id JOIN county ON county.id = area_counties_1.county_id ORDER BY anon_1.area_id


SELECT county.id AS county_id, county.county AS county_county, county.state AS county_state, county."createdAt" AS "county_createdAt", county."updatedAt" AS "county_updatedAt"
FROM county, org_counties
WHERE %(param_1)s = org_counties.org_id AND county.id = org_counties.county_id

SELECT area.id AS area_id, area.state AS area_state, area.name AS area_name, area."updatedAt" AS "area_updatedAt", area."createdAt" AS "area_createdAt", area.org_id AS area_org_id
FROM area
WHERE %(param_1)s = area.org_id

SELECT county.id AS county_id, county.county AS county_county, county.state AS county_state, county."createdAt" AS "county_createdAt", county."updatedAt" AS "county_updatedAt"
FROM county, org_counties
WHERE %(param_1)s = org_counties.org_id AND county.id = org_counties.county_id

SELECT area.id AS area_id, area.state AS area_state, area.name AS area_name, area."updatedAt" AS "area_updatedAt", area."createdAt" AS "area_createdAt", area.org_id AS area_org_id
FROM area
WHERE %(param_1)s = area.org_id

SELECT county.id AS county_id, county.county AS county_county, county.state AS county_state, county."createdAt" AS "county_createdAt", county."updatedAt" AS "county_updatedAt", anon_1.area_id AS anon_1_area_id
FROM (SELECT area.id AS area_id
FROM area
WHERE %(param_1)s = area.org_id) AS anon_1 JOIN area_counties AS area_counties_1 ON anon_1.area_id = area_counties_1.area_id JOIN county ON county.id = area_counties_1.county_id ORDER BY anon_1.area_id


/* Getting evalution by org Id queries */
SELECT evaluation.id AS evaluation_id, evaluation.name AS evaluation_name, evaluation.market_area_type AS evaluation_market_area_type, evaluation.market_area_id AS evaluation_market_area_id, evaluation.market_area_county_id AS evaluation_market_area_county_id, evaluation.current_listing AS evaluation_current_listing, evaluation.current_listing_price AS evaluation_current_listing_price, evaluation.property_sold_last_three_years AS evaluation_property_sold_last_three_years, evaluation.sale_price_string AS evaluation_sale_price_string, evaluation.sale_price AS evaluation_sale_price, evaluation.date_sold AS evaluation_date_sold, evaluation.current_use AS evaluation_current_use, evaluation.highest_and_best_use AS evaluation_highest_and_best_use, evaluation.marketing_exposure_time AS evaluation_marketing_exposure_time, evaluation.land_assessment_tax_assessor AS evaluation_land_assessment_tax_assessor, evaluation.building_assessment_tax_assessor AS evaluation_building_assessment_tax_assessor, evaluation.owner AS evaluation_owner, evaluation.property_address_id AS evaluation_property_address_id, evaluation.map_parcel_number AS evaluation_map_parcel_number, evaluation.legal_physical_access AS evaluation_legal_physical_access, evaluation.zoning AS evaluation_zoning, evaluation.utilities AS evaluation_utilities, evaluation.sewer AS evaluation_sewer, evaluation.gas AS evaluation_gas, evaluation.power AS evaluation_power, evaluation.property_rights AS evaluation_property_rights, evaluation.property_type AS evaluation_property_type, evaluation.tillable AS evaluation_tillable, evaluation.non_tillable AS evaluation_non_tillable, evaluation.irrigation_percentage AS evaluation_irrigation_percentage, evaluation.acres AS evaluation_acres, evaluation.evaluator AS evaluation_evaluator, evaluation.date_of_inspection AS evaluation_date_of_inspection, evaluation.property_rating_id AS evaluation_property_rating_id, evaluation.statistical_parameters_id AS evaluation_statistical_parameters_id, evaluation.max AS evaluation_max, evaluation.mod_max AS evaluation_mod_max, evaluation.mod_min_max AS evaluation_mod_min_max, evaluation.min AS evaluation_min, evaluation.mod_min AS evaluation_mod_min, evaluation.stnd_deviation AS evaluation_stnd_deviation, evaluation.median AS evaluation_median, evaluation.sqrt_data_count AS evaluation_sqrt_data_count, evaluation.stnd_error AS evaluation_stnd_error, evaluation.total_data_points_property AS evaluation_total_data_points_property, evaluation.num_properties_before_cal AS evaluation_num_properties_before_cal, evaluation.average AS evaluation_average, evaluation.multiplier AS evaluation_multiplier, evaluation.value_unit_concluded AS evaluation_value_unit_concluded, evaluation.reconciled_per_unit AS evaluation_reconciled_per_unit, evaluation.pdf AS evaluation_pdf, evaluation.market_trend_graph_id AS evaluation_market_trend_graph_id, evaluation.org_id AS evaluation_org_id, evaluation.pdf_images_id AS evaluation_pdf_images_id, evaluation.improvements_id AS evaluation_improvements_id, evaluation.custom_certification AS evaluation_custom_certification, evaluation.did_you_physically_inspect_property AS evaluation_did_you_physically_inspect_property, evaluation.tax_overhead_notes AS evaluation_tax_overhead_notes, evaluation.additional_exhibits_notes AS evaluation_additional_exhibits_notes, evaluation.soils_notes AS evaluation_soils_notes, evaluation.flood_map_notes AS evaluation_flood_map_notes, evaluation."createdAt" AS "evaluation_createdAt", evaluation."updatedAt" AS "evaluation_updatedAt"
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s ORDER BY evaluation."createdAt" DESC
2018-04-09 09:38:49,094 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT market_trend_graph.id AS market_trend_graph_id, market_trend_graph.scatter_data AS market_trend_graph_scatter_data, market_trend_graph.trend_data AS market_trend_graph_trend_data, market_trend_graph.m AS market_trend_graph_m, market_trend_graph.b AS market_trend_graph_b, market_trend_graph."R2" AS "market_trend_graph_R2", market_trend_graph."updatedAt" AS "market_trend_graph_updatedAt", market_trend_graph."createdAt" AS "market_trend_graph_createdAt", anon_1.evaluation_market_trend_graph_id AS anon_1_evaluation_market_trend_graph_id
FROM (SELECT DISTINCT evaluation.market_trend_graph_id AS evaluation_market_trend_graph_id
FROM evaluation 
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN market_trend_graph ON market_trend_graph.id = anon_1.evaluation_market_trend_graph_id ORDER BY anon_1.evaluation_market_trend_graph_id
2018-04-09 09:38:49,219 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT organization.id AS organization_id, organization.name AS organization_name, organization."createdAt" AS "organization_createdAt", organization."updatedAt" AS "organization_updatedAt", organization.address_id AS organization_address_id, organization.farmable_factor AS organization_farmable_factor, organization.nonfarmable_factor AS organization_nonfarmable_factor, organization.irrigation_factor AS organization_irrigation_factor, organization.disabled AS organization_disabled, organization.primary_color AS organization_primary_color, organization.logo AS organization_logo, anon_1.evaluation_org_id AS anon_1_evaluation_org_id, address_1.id AS address_1_id, address_1.address1 AS address_1_address1, address_1.address2 AS address_1_address2, address_1.city AS address_1_city, address_1.state AS address_1_state, address_1.country AS address_1_country, address_1.postal_code AS address_1_postal_code, address_1."createdAt" AS "address_1_createdAt", address_1."updatedAt" AS "address_1_updatedAt"
FROM (SELECT DISTINCT evaluation.org_id AS evaluation_org_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN organization ON organization.id = anon_1.evaluation_org_id LEFT OUTER JOIN address AS address_1 ON address_1.id = organization.address_id ORDER BY anon_1.evaluation_org_id
2018-04-09 09:38:49,588 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT address.id AS address_id, address.address1 AS address_address1, address.address2 AS address_address2, address.city AS address_city, address.state AS address_state, address.country AS address_country, address.postal_code AS address_postal_code, address."createdAt" AS "address_createdAt", address."updatedAt" AS "address_updatedAt", anon_1.evaluation_property_address_id AS anon_1_evaluation_property_address_id
FROM (SELECT DISTINCT evaluation.property_address_id AS evaluation_property_address_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN address ON address.id = anon_1.evaluation_property_address_id ORDER BY anon_1.evaluation_property_address_id
2018-04-09 09:38:49,648 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT pdf_images.id AS pdf_images_id, pdf_images.property_pictures AS pdf_images_property_pictures, pdf_images.additional_exhibits AS pdf_images_additional_exhibits, pdf_images.signature AS pdf_images_signature, pdf_images."updatedAt" AS "pdf_images_updatedAt", pdf_images."createdAt" AS "pdf_images_createdAt", anon_1.evaluation_pdf_images_id AS anon_1_evaluation_pdf_images_id
FROM (SELECT DISTINCT evaluation.pdf_images_id AS evaluation_pdf_images_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN pdf_images ON pdf_images.id = anon_1.evaluation_pdf_images_id ORDER BY anon_1.evaluation_pdf_images_id
2018-04-09 09:38:49,673 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT property_rating.id AS property_rating_id, property_rating.road_frontage AS property_rating_road_frontage, property_rating.access_frontage_easement AS property_rating_access_frontage_easement, property_rating.access_ingress_egress_quality AS property_rating_access_ingress_egress_quality, property_rating.contiguous_parcels AS property_rating_contiguous_parcels, property_rating.topography AS property_rating_topography, property_rating.soils AS property_rating_soils, property_rating.drainage AS property_rating_drainage, property_rating.additional_field_1 AS property_rating_additional_field_1, property_rating.additional_field_2 AS property_rating_additional_field_2, property_rating.additional_field_3 AS property_rating_additional_field_3, property_rating.tillable AS property_rating_tillable, property_rating.non_tillable AS property_rating_non_tillable, property_rating.irrigation_percentage AS property_rating_irrigation_percentage, property_rating.blended_result AS property_rating_blended_result, property_rating.total_subject_score AS property_rating_total_subject_score, property_rating.percentage_above_below AS property_rating_percentage_above_below, property_rating.reconciled_overall_rating AS property_rating_reconciled_overall_rating, property_rating."createdAt" AS "property_rating_createdAt", property_rating."updatedAt" AS "property_rating_updatedAt", anon_1.evaluation_property_rating_id AS anon_1_evaluation_property_rating_id
FROM (SELECT DISTINCT evaluation.property_rating_id AS evaluation_property_rating_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN property_rating ON property_rating.id = anon_1.evaluation_property_rating_id ORDER BY anon_1.evaluation_property_rating_id
2018-04-09 09:38:52,334 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT improvements.id AS improvements_id, improvements.total_improvements_value AS improvements_total_improvements_value, improvements.improvements AS improvements_improvements, improvements."updatedAt" AS "improvements_updatedAt", improvements."createdAt" AS "improvements_createdAt", anon_1.evaluation_improvements_id AS anon_1_evaluation_improvements_id
FROM (SELECT DISTINCT evaluation.improvements_id AS evaluation_improvements_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN improvements ON improvements.id = anon_1.evaluation_improvements_id ORDER BY anon_1.evaluation_improvements_id
2018-04-09 09:38:52,349 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT area.id AS area_id, area.state AS area_state, area.name AS area_name, area."updatedAt" AS "area_updatedAt", area."createdAt" AS "area_createdAt", area.org_id AS area_org_id, anon_1.evaluation_market_area_id AS anon_1_evaluation_market_area_id
FROM (SELECT DISTINCT evaluation.market_area_id AS evaluation_market_area_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN area ON area.id = anon_1.evaluation_market_area_id ORDER BY anon_1.evaluation_market_area_id
2018-04-09 09:38:52,356 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT county.id AS county_id, county.county AS county_county, county.state AS county_state, county."createdAt" AS "county_createdAt", county."updatedAt" AS "county_updatedAt", area_1.id AS area_1_id
FROM (SELECT DISTINCT evaluation.market_area_id AS evaluation_market_area_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN area AS area_1 ON area_1.id = anon_1.evaluation_market_area_id JOIN area_counties AS area_counties_1 ON area_1.id = area_counties_1.area_id JOIN county ON county.id = area_counties_1.county_id ORDER BY area_1.id
2018-04-09 09:38:52,377 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT statistical_parameters.id AS statistical_parameters_id, statistical_parameters.acreage_min AS statistical_parameters_acreage_min, statistical_parameters.acreage_max AS statistical_parameters_acreage_max, statistical_parameters.date_of_sale_min AS statistical_parameters_date_of_sale_min, statistical_parameters.date_of_sale_max AS statistical_parameters_date_of_sale_max, statistical_parameters.outlier_percentage_exclusion AS statistical_parameters_outlier_percentage_exclusion, statistical_parameters."createdAt" AS "statistical_parameters_createdAt", statistical_parameters."updatedAt" AS "statistical_parameters_updatedAt", anon_1.evaluation_statistical_parameters_id AS anon_1_evaluation_statistical_parameters_id
FROM (SELECT DISTINCT evaluation.statistical_parameters_id AS evaluation_statistical_parameters_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN statistical_parameters ON statistical_parameters.id = anon_1.evaluation_statistical_parameters_id ORDER BY anon_1.evaluation_statistical_parameters_id
2018-04-09 09:38:52,396 INFO sqlalchemy.engine.base.Engine {'org_id_1': 1}

SELECT county.id AS county_id, county.county AS county_county, county.state AS county_state, county."createdAt" AS "county_createdAt", county."updatedAt" AS "county_updatedAt", anon_1.evaluation_market_area_county_id AS anon_1_evaluation_market_area_county_id
FROM (SELECT DISTINCT evaluation.market_area_county_id AS evaluation_market_area_county_id
FROM evaluation
WHERE evaluation.org_id = %(org_id_1)s) AS anon_1 JOIN county ON county.id = anon_1.evaluation_market_area_county_id ORDER BY anon_1.evaluation_market_area_county_id
