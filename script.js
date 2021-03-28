//main variables
const width = window.innerWidth;
const height = window.innerHeight;
const shadowOffset = 20;
const tween = null;
const blockSnapSize = 20;
let connectionMapping=[]
//adding the stage
const stage = new Konva.Stage({
  container: 'grid',
  width: width,
  height: height
});
//adding the grid layers
const gridLayer = new Konva.Layer();
const padding = blockSnapSize;
for (let i = 0; i < width / padding; i++) {
  gridLayer.add(new Konva.Line({
    points: [Math.round(i * padding) + 0.5, 0, Math.round(i * padding) + 0.5, height],
    stroke: '#ddd',
    strokeWidth: 1,
  }));
}
gridLayer.add(new Konva.Line({points: [0,0,10,10]}));
for (let j = 0; j < height / padding; j++) {
  gridLayer.add(new Konva.Line({
    points: [0, Math.round(j * padding), width, Math.round(j * padding)],
    stroke: '#ddd',
    strokeWidth: 0.5,
  }));
}
//adding grid layer the stage 
stage.add(gridLayer);

//layer for drawing shapes
const layer = new Konva.Layer();



//shadowrectangle is the guiding rectangle while moving
const shadowRectangle = new Konva.Rect({
  x: 0,
  y: 0,
  width: blockSnapSize * 6,
  height: blockSnapSize * 3,
  fill: '#FF7B17',
  opacity: 0.6,
  stroke: '#CF6412',
  strokeWidth: 3,
  dash: [20, 2]
});
layer.add(shadowRectangle);
shadowRectangle.hide();
//tr2 is a transformation layer
let tr2 = new Konva.Transformer({
      nodes: [],
      ignoreStroke: true,
      padding: 5,
    });
layer.add(tr2);
tr2.hide();
stage.on('click', (e) => {
  if (e.target._id == 1) {
    tr2.hide()
    layer.draw()
  }
    
})
let newArrowClicked=false
//function to add new connector
//we have something here
  let arrowArray=[]
function newLine() {


  if (newArrowClicked == true) {
    let drawingLine = false;
    let line;
    
    stage.on('mousedown', (e) => {
     
      if (e.target._id != 1) {
        arrowArray.push(e.target)
      drawingLine = true;
      const pos = stage.getPointerPosition();
        line = new Konva.Arrow({
        dash: [3, 3],
        stroke: 'black',
        // remove line from hit graph, so we can check intersections
        listening: false,
        points: [pos.x, pos.y, pos.x, pos.y]
        });
      layer.add(line);
    }
    });
    // stage.on('mouseover', (e) => {
    //   if (e.target.attrs.name == 'rectangle') {
    //     e.target.attrs.stroke('black');
    //     layer.draw();
    // }
    // });

    // stage.on('mouseout', (e) => {
    //     if (e.target.attrs.name != 'rectangle') {
    //         e.target.attrs.stroke(null);
    //         layer.draw();
    //     }
    // });
    stage.on('mousemove', (e) => {
      if (!line) {
        return;
      }
      const pos = stage.getPointerPosition();
      const points = line.points().slice();
      points[2] = pos.x;
      points[3] = pos.y;
      line.points(points);
      layer.batchDraw();
    });

    stage.on('mouseup', (e) => {
        if (!line) {
            return;
        }
        if (e.target._id == 1) {
            line.destroy();
            layer.draw();
            line = null;
        } else {
          arrowArray.push(e.target)
          arrowArray.push(line)
          line = null;
          arrowArray[2].setAttrs({listening:true,id:arrowArray[2]._id})
          arrowArray[0].setAttrs({listening:true,id:arrowArray[0]._id})
          arrowArray[1].setAttrs({listening:true,id:arrowArray[1]._id})
          
          let obj = {
            'from': arrowArray[0],
            'to': arrowArray[1],
            'line':arrowArray[2]
          }
          updateLine(arrowArray[0], arrowArray[1], arrowArray[2])
          
          connectionMapping.push(obj)

        }
      arrowArray = []

      
      
    });
    layer.draw();
  }
  else {
    stage.off('mousedown');
    stage.off('mouseover');
    stage.off('mouseout');
    stage.off('mousemove');
    stage.off('mouseup');
  }
}

function updateLine(rect1,rect2,line) {
  const points = getPoints(rect1, rect2);
  line.points(points);
  line.setAttrs({ dash:[]})
}
function getPoints(r1, r2) {
    const c1 = getCenter(r1);
    const c2 = getCenter(r2);

    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const angle = Math.atan2(-dy, dx);

    const startOffset = getRectangleBorderPoint(angle + Math.PI, r1.size());
    const endOffset = getRectangleBorderPoint(angle, r2.size());

    const start = {
        x: c1.x - startOffset.x,
        y: c1.y - startOffset.y
    };

    const end = {
        x: c2.x - endOffset.x,
        y: c2.y - endOffset.y
    };

    return [start.x, start.y, end.x, end.y]
}
function getCenter(node) {
    return {
        x: node.x() + node.width() / 2,
        y: node.y() + node.height() / 2
    }
}
function getRectangleBorderPoint(radians, size, sideOffset = 0) {
    const width = size.width + sideOffset * 2;

    const height = size.height + sideOffset * 2;

    radians %= 2 * Math.PI;
    if (radians < 0) {
        radians += Math.PI * 2;
    }

    const phi = Math.atan(height / width);

    let x, y;
    if (
        (radians >= 2 * Math.PI - phi && radians <= 2 * Math.PI) ||
        (radians >= 0 && radians <= phi)
    ) {
        x = width / 2;
        y = Math.tan(radians) * x;
    } else if (radians >= phi && radians <= Math.PI - phi) {
        y = height / 2;
        x = y / Math.tan(radians);
    } else if (radians >= Math.PI - phi && radians <= Math.PI + phi) {
        x = -width / 2;
        y = Math.tan(radians) * x;
    } else if (radians >= Math.PI + phi && radians <= 2 * Math.PI - phi) {
        y = -height / 2;
        x = y / Math.tan(radians);
    }

    return {
        x: -Math.round(x),
        y: Math.round(y)
    };
}
function newConnecter() {
  
  if (newArrowClicked == true) {
    newArrowClicked = false
    let arrow = document.getElementsByClassName("arrowdiv")[0].style.background='gray'
    let shapes = stage.find('.rectangle')
    shapes.forEach((ele) => {
      ele.setAttrs({ draggable: true })
    })
    newLine()
  }
  else {
    newArrowClicked = true
    let arrow = document.getElementsByClassName("arrowdiv")[0].style.background='#4caf50'
    let shapes = stage.find('.rectangle')

    shapes.forEach((ele) => {
     ele.setAttrs({ draggable: false })

    })

     newLine()
  }

}
//function that adds new text box
function newTextBox(x, y, layer,stage) {
  let textNode = new Konva.Text({
        x: x,
        y: y,
        text:"some text",
        fontSize: 12,
        align: 'center',
        verticalAlign: 'middle',
        draggable: true,
        wrap:"word"
  });
  textNode.on('mouseover', function () {
      stage.container().style.cursor = 'text';
    });
  textNode.on('click', (e) => {
    if (e.evt.button == 2) {
      layer.draw();
      textNode.destroy()
      layer.draw()
    } else {
      let textPosition = textNode.getAbsolutePosition();
      let stageBox = stage.container().getBoundingClientRect();
      let areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
      };
      let textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.value = textNode.text();
      textarea.style.position = 'absolute';
      textarea.style.top = areaPosition.y + 'px';
      textarea.style.left = areaPosition.x + 'px';
      textarea.style.width = textNode.width();
      textarea.focus();
      textarea.addEventListener('keydown', function (e) {
        if (e.keyCode === 27) {
          textNode.text(textarea.value);
          layer.draw();
          document.body.removeChild(textarea);
        }
      });
    }
  });
  return textNode
}
//function that adds a new entity 
function newEntity(x, y, layer, stage, id) {
  //define these variables and depending upon the object that has been dragged set parameters
  let Url = ''
  let initialText = ''
  let width = 0
  let height=0
  if (id == 'roundrect') {
    initialText='Start'
    Url = '/assets/Start_Stop.png'
    width = blockSnapSize * 6
    height=blockSnapSize*3
  }
  if(id == 'rectangle'){
    initialText = 'Process'
    Url = '/assets/Process.png'
    width = blockSnapSize * 6
    height=blockSnapSize*3
  }
  if(id == 'rhombus'){
    initialText = 'Decision'
    Url = '/assets/Decision.png'
    width = blockSnapSize * 4
    height=blockSnapSize*4
  }
  if(id == 'input'){
    initialText = 'Input'
    Url = '/assets/Parallelogram.png'
    width = blockSnapSize * 6
    height=blockSnapSize*3
  }
  if(id == 'display'){
    initialText = 'display'
    Url = '/assets/Display.png'
    width = blockSnapSize * 4
    height=blockSnapSize*4
  }
  if(id == 'storage'){
    initialText = ''
    Url = '/assets/Storage.png'
    width = blockSnapSize * 4
    height=blockSnapSize*4
  }
  //form the image with the relevent url
  Konva.Image.fromURL(Url, function (imageNode) {
    imageNode.setAttrs({
      x: x,
      y: y,
      width: width,
      height:height,
      draggable: !newArrowClicked,
      name: 'rectangle',
    });

    layer.add(imageNode);
    layer.batchDraw();
    //get the textbox for the entity
   
    let innerTextBox = newTextBox(imageNode.x() + (imageNode.width() / 2), imageNode.y() + (imageNode.height() / 2), layer, stage);
    //helper function to set the position of text inside the image
    function updateTextPosition() {
      innerTextBox.setAttrs({
        x: imageNode.x() + (imageNode.width() - innerTextBox.width()) / 2,
        y: imageNode.y() + (imageNode.height() - innerTextBox.height()) / 2
      })

      layer.draw()
    }
    //set relevent innertext
    innerTextBox.setAttrs({
      text:initialText
    })
    //initial position 
    updateTextPosition()
    layer.add(innerTextBox);
    //drag eventhandlers
    imageNode.on('dragstart', (e) => {
      shadowRectangle.width(Math.round(imageNode.width() /blockSnapSize)*blockSnapSize)
      shadowRectangle.height(Math.round(imageNode.height() /blockSnapSize)*blockSnapSize)
      shadowRectangle.show();
      shadowRectangle.moveToTop();
      imageNode.moveToTop();
    });
    imageNode.on('dragend', (e) => {

      let Fromconn = connectionMapping.filter(con => con.from._id == imageNode._id);
      let Toconn = connectionMapping.filter(con => con.to._id == imageNode._id);

      Fromconn.forEach(obj => {
        updateLine(imageNode,obj.to,obj.line)
      })
      Toconn.forEach(obj => {
        updateLine(obj.from,imageNode,obj.line)
      })
      //updateLine(arrowArray[0], arrowArray[1], arrowArray[2])
      imageNode.position({
        x: Math.round(imageNode.x() / blockSnapSize) * blockSnapSize,
        y: Math.round(imageNode.y() / blockSnapSize) * blockSnapSize
      });
      updateTextPosition()
      stage.batchDraw();
      shadowRectangle.hide();
      innerTextBox.moveToTop();
    });
    imageNode.on('dragmove', (e) => {
    //updateLine(arrowArray[0], arrowArray[1], arrowArray[2])
      let Fromconn = connectionMapping.filter(con => con.from._id == imageNode._id);
      let Toconn = connectionMapping.filter(con => con.to._id == imageNode._id);
      Fromconn.forEach(obj => {
        updateLine(imageNode,obj.to,obj.line)
      })
      Toconn.forEach(obj => {
        updateLine(obj.from,imageNode,obj.line)
      })
     shadowRectangle.position({
      x: Math.round(imageNode.x() / blockSnapSize) * blockSnapSize,
      y: Math.round(imageNode.y() / blockSnapSize) * blockSnapSize
     });
    updateTextPosition()
    innerTextBox.moveToTop();
    stage.batchDraw();
    });
  //transformation event handlers 
    imageNode.on('click', (e) => {
     tr2.setAttrs({nodes:[imageNode]})
     tr2.show()
     if (e.evt.button == 2) {
      tr2.hide()  
      imageNode.destroy()
      innerTextBox.destroy()
      layer.draw()
      
     }
   })
    imageNode.on('transform', () => {
      imageNode.setAttrs({
        width: Math.max(Math.round(imageNode.width() * imageNode.scaleX() / blockSnapSize) * blockSnapSize, 5),
        height: Math.max(Math.round(imageNode.height() * imageNode.scaleY() / blockSnapSize) * blockSnapSize, 5),
        scaleX: 1,
        scaleY: 1,
      });
      updateTextPosition()
            let Fromconn = connectionMapping.filter(con => con.from._id == imageNode._id);
      let Toconn = connectionMapping.filter(con => con.to._id == imageNode._id);
      Fromconn.forEach(obj => {
        updateLine(imageNode,obj.to,obj.line)
      })
      Toconn.forEach(obj => {
        updateLine(obj.from,imageNode,obj.line)
      })
    shadowRectangle.width(Math.round(imageNode.width() * imageNode.scaleX() / blockSnapSize) * blockSnapSize)
    shadowRectangle.height(Math.round(imageNode.height() * imageNode.scaleY() / blockSnapSize) * blockSnapSize) 
    })   
    //pointer changing events
    imageNode.on('mouseover', function () {
        stage.container().style.cursor = 'move';
      });
    imageNode.on('mouseout', function () {
      stage.container().style.cursor = 'default';
    });
  })
  stage.batchDraw(); 
}

//main eventhandler to handle dragover from toolbar to grid
let itemURL = '';
const images = document.getElementsByClassName('drag-items')
for (var i = 0; i < images.length; i++) {
  images[i].addEventListener('dragstart', function (e) {        
          itemURL = e.target.id;
        });  
}
let con = stage.container();
    con.addEventListener('dragover', function (e) {
        e.preventDefault(); // !important
    });
stage.on('contentContextmenu', (e) => {
  e.evt.preventDefault();
});
con.addEventListener('drop', function (e) {
  e.preventDefault();
  stage.setPointersPositions(e);
  let x = stage.getPointersPositions()[0].x
  let y = stage.getPointersPositions()[0].y
    switch (itemURL) {
  case 'arrow':
    //newConnecter()
    break;
  case 'text':
    let textNode = newTextBox(Math.round(x / blockSnapSize) * blockSnapSize, Math.round(y / blockSnapSize) * blockSnapSize, layer, stage);
    layer.add(textNode);

    stage.batchDraw();
    break;
  case 'roundrect':
     newEntity(Math.round(x / blockSnapSize) * blockSnapSize, Math.round(y / blockSnapSize) * blockSnapSize, layer, stage,itemURL);
    break;
  case 'rectangle':
    newEntity(Math.round(x / blockSnapSize) * blockSnapSize, Math.round(y / blockSnapSize) * blockSnapSize, layer, stage,itemURL);
    break;
  case 'rhombus':
    newEntity(Math.round(x / blockSnapSize) * blockSnapSize, Math.round(y / blockSnapSize) * blockSnapSize, layer, stage,itemURL);
    break;
  case 'input':
    newEntity(Math.round(x / blockSnapSize) * blockSnapSize, Math.round(y / blockSnapSize) * blockSnapSize, layer, stage,itemURL);
    break;
  case 'storage':
    newEntity(Math.round(x / blockSnapSize) * blockSnapSize, Math.round(y / blockSnapSize) * blockSnapSize, layer, stage,itemURL);
    break;
  case 'display':
    newEntity(Math.round(x / blockSnapSize) * blockSnapSize, Math.round(y / blockSnapSize) * blockSnapSize, layer, stage,itemURL);
    break;
}
    stage.add(layer);

});

