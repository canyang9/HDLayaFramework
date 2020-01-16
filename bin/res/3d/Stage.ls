{
	"version":"LAYASCENE3D:02",
	"data":{
		"type":"Scene3D",
		"props":{
			"name":"Stage",
			"ambientColor":[
				0.7352941,
				0.7352941,
				0.7352941
			],
			"lightmaps":[
				{
					"constructParams":[
						256,
						256,
						1,
						false
					],
					"propertyParams":{
						"filterMode":1,
						"wrapModeU":1,
						"wrapModeV":1,
						"anisoLevel":3
					},
					"path":"Assets/Game/scene/Stage/Lightmap-0_comp_light.png"
				}
			],
			"enableFog":false,
			"fogStart":10,
			"fogRange":5,
			"fogColor":[
				0.882353,
				1,
				1
			]
		},
		"child":[
			{
				"type":"DirectionLight",
				"instanceID":0,
				"props":{
					"name":"Directional light",
					"active":true,
					"isStatic":false,
					"layer":0,
					"position":[
						0.6161448,
						-0.7299503,
						-0.04963923
					],
					"rotation":[
						0.1093816,
						0.8754261,
						0.4082179,
						-0.2345697
					],
					"scale":[
						1,
						1,
						1
					],
					"intensity":1,
					"lightmapBakedType":0,
					"color":[
						0.6764706,
						0.6764706,
						0.6764706
					]
				},
				"components":[],
				"child":[]
			},
			{
				"type":"Camera",
				"instanceID":1,
				"props":{
					"name":"Main Camera",
					"active":true,
					"isStatic":false,
					"layer":0,
					"position":[
						0,
						0.2,
						0
					],
					"rotation":[
						0,
						0.7071068,
						0,
						-0.7071068
					],
					"scale":[
						1,
						1,
						1
					],
					"clearFlag":1,
					"orthographic":false,
					"orthographicVerticalSize":10,
					"fieldOfView":70,
					"enableHDR":true,
					"nearPlane":0.01,
					"farPlane":50,
					"viewport":[
						0,
						0,
						1,
						1
					],
					"clearColor":[
						0.1921569,
						0.3019608,
						0.4745098,
						0
					]
				},
				"components":[],
				"child":[]
			},
			{
				"type":"MeshSprite3D",
				"instanceID":2,
				"props":{
					"name":"beach",
					"active":true,
					"isStatic":false,
					"layer":0,
					"position":[
						2,
						0.04,
						0
					],
					"rotation":[
						0,
						0.7071068,
						0,
						-0.7071068
					],
					"scale":[
						6,
						1,
						1
					],
					"meshPath":"Assets/Game/Meshes/beach-beach.lm",
					"enableRender":true,
					"materials":[
						{
							"path":"Assets/Game/Materials/all.lmat"
						}
					]
				},
				"components":[],
				"child":[
					{
						"type":"MeshSprite3D",
						"instanceID":3,
						"props":{
							"name":"sea",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								0,
								-0.06,
								6
							],
							"rotation":[
								0,
								-0.7071068,
								0,
								-0.7071068
							],
							"scale":[
								33,
								32,
								12.16667
							],
							"meshPath":"Assets/Game/Meshes/sea-sea.lm",
							"lightmapIndex":0,
							"lightmapScaleOffset":[
								0.9179688,
								0.9179688,
								0,
								0
							],
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/water.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					}
				]
			},
			{
				"type":"Sprite3D",
				"instanceID":4,
				"props":{
					"name":"waveNode",
					"active":true,
					"isStatic":false,
					"layer":0,
					"position":[
						0,
						0,
						0
					],
					"rotation":[
						0,
						0,
						0,
						-1
					],
					"scale":[
						1,
						1,
						1
					]
				},
				"components":[],
				"child":[
					{
						"type":"MeshSprite3D",
						"instanceID":5,
						"props":{
							"name":"wave2",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								1,
								0,
								0
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								3.489526,
								32,
								60
							],
							"meshPath":"Assets/Game/Meshes/sea-sea.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/lang.lmat"
								}
							]
						},
						"components":[
							{
								"type":"Animator",
								"layers":[
									{
										"name":"Base Layer",
										"weight":0,
										"blendingMode":0,
										"states":[
											{
												"name":"wave2",
												"clipPath":"Assets/Game/animation/wave2-wave2.lani"
											},
											{
												"name":"wave3"
											},
											{
												"name":"wave3 0"
											}
										]
									}
								],
								"cullingMode":0,
								"playOnWake":true
							}
						],
						"child":[]
					}
				]
			},
			{
				"type":"Sprite3D",
				"instanceID":6,
				"props":{
					"name":"homeNode",
					"active":true,
					"isStatic":false,
					"layer":0,
					"position":[
						2.670072,
						-0.001075149,
						0
					],
					"rotation":[
						0,
						0,
						0,
						-1
					],
					"scale":[
						1,
						1,
						1
					]
				},
				"components":[],
				"child":[
					{
						"type":"MeshSprite3D",
						"instanceID":7,
						"props":{
							"name":"home_tower",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-0.2700715,
								0.03107515,
								0.2875046
							],
							"rotation":[
								0,
								1,
								0,
								0
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/tower-tower.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[
							{
								"type":"Animator",
								"layers":[],
								"cullingMode":0,
								"playOnWake":true
							}
						],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":8,
						"props":{
							"name":"mountain_front",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								3.329928,
								0.001075149,
								0.3875046
							],
							"rotation":[
								0.4999999,
								-0.5000001,
								0.5000001,
								0.4999999
							],
							"scale":[
								55.00008,
								1,
								20.00002
							],
							"meshPath":"Assets/Game/Meshes/sea-sea.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/mountain.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":9,
						"props":{
							"name":"mountain_back",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								8.329928,
								0.5010751,
								6.107504
							],
							"rotation":[
								0.5,
								-0.5,
								0.5,
								0.5
							],
							"scale":[
								55,
								1,
								20
							],
							"meshPath":"Assets/Game/Meshes/sea-sea.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/mountain.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"Sprite3D",
						"instanceID":10,
						"props":{
							"name":"bushes",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								0,
								0,
								0
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								1,
								1,
								1
							]
						},
						"components":[],
						"child":[
							{
								"type":"MeshSprite3D",
								"instanceID":11,
								"props":{
									"name":"bush (1)",
									"active":true,
									"isStatic":true,
									"layer":0,
									"position":[
										0.8299999,
										0.07607515,
										2
									],
									"rotation":[
										0,
										0.7071068,
										0,
										-0.7071068
									],
									"scale":[
										6,
										1.5,
										2
									],
									"meshPath":"Assets/Game/Meshes/bush-bush.lm",
									"enableRender":true,
									"materials":[
										{
											"path":"Assets/Game/Materials/all.lmat"
										}
									]
								},
								"components":[],
								"child":[]
							},
							{
								"type":"MeshSprite3D",
								"instanceID":12,
								"props":{
									"name":"bush (2)",
									"active":true,
									"isStatic":true,
									"layer":0,
									"position":[
										0.83,
										0.07607515,
										0.52
									],
									"rotation":[
										0,
										0.7071068,
										0,
										-0.7071068
									],
									"scale":[
										6.000004,
										1.5,
										2.000001
									],
									"meshPath":"Assets/Game/Meshes/bush-bush.lm",
									"enableRender":true,
									"materials":[
										{
											"path":"Assets/Game/Materials/all.lmat"
										}
									]
								},
								"components":[],
								"child":[]
							},
							{
								"type":"MeshSprite3D",
								"instanceID":13,
								"props":{
									"name":"bush (3)",
									"active":true,
									"isStatic":true,
									"layer":0,
									"position":[
										0.83,
										0.07607515,
										-1
									],
									"rotation":[
										0,
										0.7071068,
										0,
										-0.7071068
									],
									"scale":[
										6.000014,
										1.5,
										2.000001
									],
									"meshPath":"Assets/Game/Meshes/bush-bush.lm",
									"enableRender":true,
									"materials":[
										{
											"path":"Assets/Game/Materials/all.lmat"
										}
									]
								},
								"components":[],
								"child":[]
							},
							{
								"type":"MeshSprite3D",
								"instanceID":14,
								"props":{
									"name":"bush (4)",
									"active":true,
									"isStatic":true,
									"layer":0,
									"position":[
										0.83,
										0.07607515,
										-2.47
									],
									"rotation":[
										0,
										0.7071068,
										0,
										-0.7071068
									],
									"scale":[
										6.000024,
										1.5,
										2.000001
									],
									"meshPath":"Assets/Game/Meshes/bush-bush.lm",
									"enableRender":true,
									"materials":[
										{
											"path":"Assets/Game/Materials/all.lmat"
										}
									]
								},
								"components":[],
								"child":[]
							},
							{
								"type":"MeshSprite3D",
								"instanceID":15,
								"props":{
									"name":"bush (5)",
									"active":true,
									"isStatic":true,
									"layer":0,
									"position":[
										0.83,
										0.07607515,
										3.55
									],
									"rotation":[
										0,
										0.7071068,
										0,
										-0.7071068
									],
									"scale":[
										6.000034,
										1.5,
										2.000001
									],
									"meshPath":"Assets/Game/Meshes/bush-bush.lm",
									"enableRender":true,
									"materials":[
										{
											"path":"Assets/Game/Materials/all.lmat"
										}
									]
								},
								"components":[],
								"child":[]
							},
							{
								"type":"MeshSprite3D",
								"instanceID":16,
								"props":{
									"name":"bush (6)",
									"active":true,
									"isStatic":true,
									"layer":0,
									"position":[
										0.83,
										0.07607515,
										-3.99
									],
									"rotation":[
										0,
										0.7071068,
										0,
										-0.7071068
									],
									"scale":[
										6.000044,
										1.5,
										2.000001
									],
									"meshPath":"Assets/Game/Meshes/bush-bush.lm",
									"enableRender":true,
									"materials":[
										{
											"path":"Assets/Game/Materials/all.lmat"
										}
									]
								},
								"components":[],
								"child":[]
							}
						]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":17,
						"props":{
							"name":"tree",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								0.1299284,
								0.001075149,
								-0.01249537
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/tree-tree.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":18,
						"props":{
							"name":"unbrella",
							"active":true,
							"isStatic":true,
							"layer":0,
							"position":[
								-0.0700717,
								0.001075149,
								-0.4124954
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/unbrella-unbrella.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":19,
						"props":{
							"name":"chair",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-0.2700715,
								0.01107515,
								-0.6124954
							],
							"rotation":[
								0,
								0.7071068,
								0,
								-0.7071068
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/chair-chair.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[
							{
								"type":"Animator",
								"layers":[],
								"cullingMode":0,
								"playOnWake":true
							}
						],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":20,
						"props":{
							"name":"starfish",
							"active":true,
							"isStatic":true,
							"layer":0,
							"position":[
								-1.554072,
								-0.022,
								-0.3824953
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/starfish-starfish.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":21,
						"props":{
							"name":"shell",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-0.9800715,
								0.01607515,
								-0.04149535
							],
							"rotation":[
								0,
								0.7071068,
								0,
								-0.7071068
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/shell-shell.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[
							{
								"type":"Animator",
								"layers":[],
								"cullingMode":0,
								"playOnWake":true
							}
						],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":22,
						"props":{
							"name":"tree",
							"active":true,
							"isStatic":true,
							"layer":0,
							"position":[
								0.1299284,
								0.001075149,
								-1.2
							],
							"rotation":[
								-0.097279,
								0.4171638,
								0.002583608,
								-0.9036064
							],
							"scale":[
								0.8,
								0.8,
								0.8
							],
							"meshPath":"Assets/Game/Meshes/tree-tree.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":23,
						"props":{
							"name":"rock1",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-3.877,
								-0.09892485,
								-0.23
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								0.800001,
								0.8,
								0.800001
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":24,
						"props":{
							"name":"blue_float",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-3.081,
								-0.01492485,
								-0.244
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/blue_float-blue_float.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":25,
						"props":{
							"name":"board",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-3.393,
								-0.09892485,
								-1.239
							],
							"rotation":[
								0,
								0,
								0,
								-1
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/board-board.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":26,
						"props":{
							"name":"stick",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-1.8,
								-0.09892485,
								-0.1
							],
							"rotation":[
								0,
								0.7071068,
								0,
								-0.7071068
							],
							"scale":[
								1,
								1,
								1
							],
							"meshPath":"Assets/Game/Meshes/stick-stick.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[
							{
								"type":"MeshSprite3D",
								"instanceID":27,
								"props":{
									"name":"wave (2)",
									"active":true,
									"isStatic":false,
									"layer":0,
									"position":[
										0,
										0.08,
										0
									],
									"rotation":[
										0,
										-0.7071068,
										0,
										-0.7071068
									],
									"scale":[
										0.09756014,
										0.09756,
										0.04516673
									],
									"meshPath":"Assets/Game/Meshes/sea-sea.lm",
									"enableRender":true,
									"materials":[
										{
											"path":"Assets/Game/Materials/shuiquan.lmat"
										}
									]
								},
								"components":[
									{
										"type":"Animator",
										"layers":[
											{
												"name":"Base Layer",
												"weight":0,
												"blendingMode":0,
												"states":[
													{
														"name":"wave",
														"clipPath":"Assets/Game/animation/wave-wave.lani"
													}
												]
											}
										],
										"cullingMode":0,
										"playOnWake":true
									}
								],
								"child":[]
							}
						]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":28,
						"props":{
							"name":"rock2",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-3.061,
								-0.09892485,
								0.671
							],
							"rotation":[
								0,
								0.7071068,
								0,
								-0.7071068
							],
							"scale":[
								0.8000004,
								0.8,
								0.8000004
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":29,
						"props":{
							"name":"rock3",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-2.371,
								-0.09892485,
								-0.234
							],
							"rotation":[
								0,
								1,
								0,
								0
							],
							"scale":[
								0.8000004,
								0.8,
								0.8000004
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":30,
						"props":{
							"name":"rock4",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-3.085,
								-0.09892485,
								-1.018
							],
							"rotation":[
								0,
								1,
								0,
								0
							],
							"scale":[
								0.8000004,
								0.8,
								0.8000004
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":31,
						"props":{
							"name":"rock5",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-2.536,
								-0.09892485,
								-0.781
							],
							"rotation":[
								0,
								1,
								0,
								0
							],
							"scale":[
								0.8000004,
								0.8,
								0.8000004
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":32,
						"props":{
							"name":"rock6",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-2.536,
								-0.09892485,
								0.397
							],
							"rotation":[
								0,
								1,
								0,
								0
							],
							"scale":[
								0.8000004,
								0.8,
								0.8000004
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":33,
						"props":{
							"name":"rock7",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-3.622,
								-0.09892485,
								-0.75
							],
							"rotation":[
								0,
								1,
								0,
								0
							],
							"scale":[
								0.8000004,
								0.8,
								0.8000004
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					},
					{
						"type":"MeshSprite3D",
						"instanceID":34,
						"props":{
							"name":"rock8",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-3.627,
								-0.09892485,
								0.378
							],
							"rotation":[
								0,
								1,
								0,
								0
							],
							"scale":[
								0.8000004,
								0.8,
								0.8000004
							],
							"meshPath":"Assets/Game/Meshes/rock3-rock3.lm",
							"enableRender":true,
							"materials":[
								{
									"path":"Assets/Game/Materials/all.lmat"
								}
							]
						},
						"components":[],
						"child":[]
					}
				]
			}
		]
	}
}